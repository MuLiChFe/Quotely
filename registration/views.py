from django.shortcuts import render, HttpResponse, redirect
from django.views import View
from django.http import JsonResponse
from django.urls import reverse
from django.utils import timezone
from .models import User, Verify
from .forms import RegisterForm, LoginForm
from tools import EmailManage


# Create your views here.

def verification_email(email, token=''):
    if not token:
        verify_link = Verify.objects.create(email=email)
        token = verify_link.token
    EmailManage.send_verification_email(email, token)
    return token


class RegisterView(View):
    def get(self, request):
        form = RegisterForm()
        registration_email = request.session.pop('registration_email', '')
        registration_password = request.session.pop('registration_password', '')
        registration_errors = request.session.pop('registration_errors', None)
        form.update(registration_email, registration_password)
        context = {
            'form': form,
            'errors': registration_errors,
        }
        return render(request, 'registration/register.html', context)

    def post(self, request):
        form = RegisterForm(request.POST)
        if form.is_valid():
            verification_email(form.cleaned_data['email'])
            form.save()
            return redirect('registration:verify_email', email=form.cleaned_data['email'])
        request.session['registration_email'] = request.POST.get('email')
        request.session['registration_password'] = request.POST.get('password')
        request.session['registration_errors'] = form.errors
        return redirect('registration:register')


class LoginView(View):
    def get(self, request):
        form = LoginForm()
        login_email = request.session.pop('login_email', '')
        login_password = request.session.pop('login_password', '')
        login_errors = request.session.pop('login_errors', None)
        form.update(login_email, login_password)
        need_verify = False
        if login_errors:
            print(login_errors)
            need_verify = True if 'Your email is not verified' in login_errors.get('email','') else False
        context = {
            'form': form,
            'errors': login_errors,
            'need_verify': need_verify
        }
        return render(request, 'registration/login.html', context)

    def post(self, request):
        form = LoginForm(request.POST)
        if form.is_valid():
            user = User.objects.get(email=request.POST['email'])
            request.session.flush()
            request.session['user_id'] = user.id
            return redirect('engine:index')
        request.session['login_email'] = request.POST.get('email')
        request.session['login_password'] = request.POST.get('password')
        request.session['login_errors'] = form.errors
        return redirect('registration:login')


class VerifyEmail(View):
    @staticmethod
    def verify_email(email):
        verify = Verify.objects.filter(email=email).last()
        if verify.is_expired():
            verification_email(email)
        else:
            verification_email(email, verify.token)
        return True

    def get(self, request, email):
        is_verified = request.session.pop('email_verified', False)

        if not Verify.objects.filter(email=email).exists():
            return redirect('engine:index')

        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            return JsonResponse({'verified': is_verified})

        last_verify = Verify.objects.filter(email=email).last()
        if last_verify.is_expired():
            self.verify_email(email)
            request.session['resend_success'] = True

        resend_success = request.session.pop('resend_success', False)
        resend_time = timezone.now() if resend_success else None

        context = {
            'email': email,
            'resend_success': resend_success,
            'resend_time': resend_time
        }
        return render(request, 'registration/verify_email.html', context)

    def post(self, request, email):
        verify = Verify.objects.filter(email=email).last()
        if not verify:
            return redirect('engine:index')
        self.verify_email(email)
        request.session['resend_success'] = True

        return redirect(reverse('registration:verify_email', args=[email]))


def verify_token(request, token):
    verify = Verify.objects.filter(token=token).first()
    if not verify:
        return redirect('engine:index')
    if verify.is_expired():
        return HttpResponse("<h1>Email verification link expired</h1>")

    user = User.objects.filter(email=verify.email).first()
    user.is_verified = True
    user.save()
    request.session.flush()
    request.session['email_verified'] = True
    Verify.objects.filter(email=verify.email).delete()  # Delete token after use
    request.session['user_id'] = user.id  # Store only the user ID

    return redirect("engine:index")


def Logout(request):
    request.session.clear()  # 清除session
    return redirect('engine:index')

def clean(request):
    User.objects.all().delete()
    Verify.objects.all().delete()
    return redirect('engine:index')