import './components/Image-picker/image-picker.css';
import './components/Image-picker/image-picker.js';
import { ColorPicker } from './components/Color-picker/colorpicker.js';

import { init, onclickImagePicker, onclickImagePicker2, onclickCP} from './components/scene/scene.js';


app();

function app() {
    //const element = document.getElementById('app');

    //init
    $(".image-picker").imagepicker({
      hide_select : true,
      show_label  : false,
      clicked: onclickImagePicker
      });
    $(".image-picker2").imagepicker({
      hide_select : true,
      show_label  : false,
      clicked: onclickImagePicker2
      });
    ColorPicker( onclickCP );
  
    init();
  
    return true;
  }
  
