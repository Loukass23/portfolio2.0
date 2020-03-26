import prepare from './structure/prepare';
import '../style.scss';

window.scrollTo(0, 2);
document.onkeydown = function (e) {
    switch (e.keyCode) {
        case 37:
            $("#carouselProjects").carousel("next");
            break;
        case 39:
            $("#carouselProjects").carousel("prev");
            break;
    }
};
prepare();