/* eslint-disable */

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Content, Row, Col, Box, Button } from 'adminlte-2-react'
import 'gatsby-ipfs-web-wallet/src/components/qr-scanner/qr-scanner.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import QrReader from 'react-qr-reader'
import { getWalletInfo } from 'gatsby-ipfs-web-wallet/src/components/localWallet'

import './sweep.css'
let _this

class SweepScanner extends Component {
  constructor(props) {
    super(props)
    _this = this
    this.state = {
      facingMode: 'environment',

    }
    // The library QrReader calls to the scan function constantly,
    // sending null as a parameter if it does not read anything,
    // so it's advisable to insert code inside a validation

    this.handleScan = async data => {
      if (data) {
        _this.props.onScan(data)
      }
    }

    this.handleError = err => {
      console.error(err)
      _this.props.onError ? _this.props.onError(err) : console.error(err)
    }
  }

  render() {
    return (
      <>
        <Content
          modal
          show={_this.props.show}
          modalCloseButton
          onHide={_this.props.handleOnHide}
        >
          <Row>
            <Col sm={3} />
            <Col >
              <Box className="hover-shadow border-none mt-2">
                <div>
                  <Row>
                    <Col sm={12} className="text-center">
                      <h1>
                        <FontAwesomeIcon
                          className="title-icon"
                          size="xs"
                          icon="arrow-circle-up"
                        />
                        <span>Sweep Wallet</span>
                      </h1>
                      <QrReader
                        delay={300}
                        onError={_this.handleError}
                        onScan={_this.handleScan}
                        facingMode={_this.state.facingMode}
                      />
                      <b>
                        <p className="qr-result">{_this.state.success}</p>
                      </b>
                    </Col>
                  </Row>
                </div>
              </Box>
            </Col>
            <Col sm={3} />
          </Row>
        </Content>
      </>
    )
  }

  handleChangeMode() {
    const mode = _this.state.facingMode === 'user' ? 'environment' : 'user'
    _this.setState({
      facingMode: mode
    })
  }


  validateWIF(WIF) {
    if (typeof WIF !== 'string') {
      return false
    }

    if (WIF.length !== 52) {
      return false
    }

    if (WIF[0] !== 'L' && WIF[0] !== 'K') {
      return false
    }

    return true
  }
}

SweepScanner.propTypes = {
  onError: PropTypes.func,
  onScan: PropTypes.func,
  handleOnHide: PropTypes.func,
  show: PropTypes.bool
}

export default SweepScanner
