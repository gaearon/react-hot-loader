import React from 'react'
import ReactDOM from 'react-dom'

const modalRootId = 'modal-root'
let modalRoot = document.getElementById(modalRootId)
if (!modalRoot) {
  modalRoot = document.createElement('div')
  modalRoot.id = modalRootId
  document.body.appendChild(modalRoot)
}

const styles = {
  modal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    border: '1px solid rgb(204, 204, 204)',
    background: 'rgb(255, 255, 255)',
    overflow: 'auto',
    borderRadius: '4px',
    outline: 'none',
    padding: '20px',
    zIndex: '1000',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
  closeButton: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background:
      'url(data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjMDAwMDAwIiBoZWlnaHQ9IjQ4IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSI0OCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCiAgICA8cGF0aCBkPSJNMTkgNi40MUwxNy41OSA1IDEyIDEwLjU5IDYuNDEgNSA1IDYuNDEgMTAuNTkgMTIgNSAxNy41OSA2LjQxIDE5IDEyIDEzLjQxIDE3LjU5IDE5IDE5IDE3LjU5IDEzLjQxIDEyeiIvPg0KICAgIDxwYXRoIGQ9Ik0wIDBoMjR2MjRIMHoiIGZpbGw9Im5vbmUiLz4NCjwvc3ZnPg==) no-repeat',
    backgroundSize: 'contain',
    width: '24px',
    height: '24px',
    cursor: 'pointer',
  },
  content: {
    minWidth: '300px',
    maxWidth: '90vw',
    maxHeight: 'calc(100vh - 100px)',
  },
  overlay: {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: '999',
  },
}

class Modal extends React.Component {
  constructor(props) {
    super(props)
    this.el = document.createElement('div')
    Object.keys(styles.overlay).forEach(key => {
      this.el.style[key] = styles.overlay[key]
    })
  }

  props: {
    onRequestClose: Function,
    title: string,
    children: Object,
    hideTitle?: boolean,
  }

  componentDidMount() {
    modalRoot.appendChild(this.el)
  }

  componentWillUnmount() {
    modalRoot.removeChild(this.el)
  }

  render() {
    const { onRequestClose, title, children, hideTitle } = this.props
    return ReactDOM.createPortal(
      <div
        style={styles.modal}
        role="dialog"
        aria-labelledby="modal__title"
        aria-describedby="modal__content"
      >
        {!hideTitle && (
          <div id="modal__title" style={{ fontSize: '1.5em' }}>
            {title}
          </div>
        )}
        <div
          style={styles.closeButton}
          onClick={onRequestClose}
          title="Close"
        />
        <div id="modal__content" style={styles.content}>
          {children}
        </div>
      </div>,
      this.el,
    )
  }
}

export default Modal
