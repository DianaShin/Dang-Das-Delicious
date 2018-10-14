import axios from 'axios';
import { $ } from './bling';

function ajaxHeart(e) {
  e.preventDefault();
  axios
    .post(this.action) //this is form.heart element
    .then(res => {
      const isHearted = this.heart.classList.toggle('heart__button--hearted');
      // heart is a sub element inside 'form.heart' with
      //'name' attribute of 'heart' - so this is the heart button
      $('.heart-count').textContent = res.data.hearts.length;
      if (isHearted) {
        this.heart.classList.add('heart__button--float');
        setTimeout(() => this.heart.classList.remove('heart__button--float'),
          2500);
      }
    })
    .catch(console.error);
}

export default ajaxHeart;
