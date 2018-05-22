// @flow
import React from 'react'
import Modal from './Modal'
import { EDIT_ME } from './_editMe'

const ModalComponent = ({ onRequestClose }: { onRequestClose: Function }) => (
  <Modal onRequestClose={onRequestClose} title="Modal Component">
    {EDIT_ME}
  </Modal>
)

export default ModalComponent
