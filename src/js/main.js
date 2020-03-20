import prepare from './structure/prepare';
import '../style.scss';

window.scrollTo(0, 0);



document.onkeydown = function (e) {
    console.log('e.keyCode :', e.keyCode);

    switch (e.keyCode) {
        case 37:
            console.log('nesxt :');
            $("#carouselProjects").carousel("next");
            break;
        case 39:
            $("#carouselProjects").carousel("prev");
            break;
    }
}
prepare();