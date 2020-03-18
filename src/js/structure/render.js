/* eslint-disable no-trailing-spaces */
/* eslint-disable no-mixed-operators */
/* eslint-disable no-return-assign */
import props from './config/defaults';
import uos from 'uos';

export default function render() {
  props.renderer.render(props.scene, props.camera);
}
const windowResizeHandler = () => {
  props.camera.aspect = window.innerWidth / window.innerHeight;
  props.camera.updateProjectionMatrix();
  props.renderer.setSize(window.innerWidth, window.innerHeight);
  const divs = document.querySelectorAll('.heading');
  for (let i = 0; i < divs.length; i += 1) {
    divs[i].style.height = `${window.innerHeight}px`;
  }
  render();
};
export const initUOS = () => {
  const instances = props.phenomenons;
  const headings = document.querySelectorAll('.heading');
  const header = document.querySelector('.header');
  const loader = document.querySelector('.loader');
  uos(0, 1, () => render());

  uos(0, 0.05, p => (header.style.opacity = 1 - p));

  const step = 1 / instances.length;

  for (let i = 0; i < instances.length; i += 1) {
    const transitionBegin = i * step;
    const transitionEnd = transitionBegin + step * 0.5;
    const textEnd = (i + 1) * step;
    uos(transitionBegin, transitionEnd, p => 
      (instances[i].uniforms.time.value = p));
    uos(transitionEnd, textEnd, (p) => {
      let np = p * 2.0 - 1.0;
      np = 1.0 - np * np;
      headings[i].style.opacity = i === instances.length - 1 ? p * 1.5 : np * 1.5;
    });
  }
  loader.style.opacity = 0;
  requestAnimationFrame(() => {
    window.scrollTo(0, 0);
    windowResizeHandler();
    header.style.opacity = 1;
  });
};



window.addEventListener('resize', windowResizeHandler, false);
