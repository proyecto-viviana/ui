import { keyframes } from "../style/style-macro";

const progressCircleRotationAnimation = keyframes(`
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
`);
const progressCircleDashoffsetAnimation = keyframes(`
  0%, 100% {
    stroke-dashoffset: 75;
  }

  30% {
    stroke-dashoffset: 20;
  }
`);

export const s2ProgressCircleIndeterminateAnimation = `${progressCircleRotationAnimation} 1s cubic-bezier(.6, .1, .3, .9) infinite, ${progressCircleDashoffsetAnimation} 1s cubic-bezier(.25, .1, .25, 1.3) infinite`;
