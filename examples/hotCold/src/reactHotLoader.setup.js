import { setConfig, cold } from 'react-hot-loader'

setConfig({
  onComponentRegister: (type, name, file) =>
    file.indexOf('node_modules') > 0 && cold(type),
})
