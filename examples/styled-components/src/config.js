import { setConfig } from 'react-hot-loader';
import ReactDOM from 'react-dom';

setConfig({
  ignoreSFC: !!ReactDOM.setHotElementComparator,
  pureSFC: true,
  pureRender: true,
});
