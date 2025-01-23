export function vimeoVideo(vimeo_id,start_play_time) {
    console.log(`src="https://player.vimeo.com/video/${vimeo_id}?&amp;portrait=0&amp;title=0&amp;byline=0&amp;pip=0#t=${start_play_time }"    `)
    return `
        <iframe
            src="https://player.vimeo.com/video/${vimeo_id}?&amp;portrait=0&amp;title=0&amp;byline=0&amp;pip=0#t=${start_play_time }"
            frameBorder="0" webkitallowfullscreen mozallowfullscreen allowFullScreen
            style="position: relative; top: 0; left: 0; width: 100%; height: 100%">
        </iframe>
    `
}