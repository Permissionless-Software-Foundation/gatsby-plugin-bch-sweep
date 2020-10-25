/* eslint-disable */

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Content, Row, Col, Box, Button, Inputs } from 'adminlte-2-react'
import 'gatsby-ipfs-web-wallet/src/components/qr-scanner/qr-scanner.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import QrReader from 'react-qr-reader'
import { getWalletInfo } from 'gatsby-ipfs-web-wallet/src/components/localWallet'
import SweepScanner from './sweep-scanner'
import './sweep.css'

const { Text } = Inputs
let _this

class Sweep extends Component {
  constructor(props) {
    super(props)
    _this = this

    this.state = {
      WIF: '',
      success: false,
      isSweeping: false,
      txId: '',
      errMsg: '',
      showScanner: false
    }
  }

  render() {
    return (
      <>
        <Content>
          <Row>
            <Col sm={3} />
            <Col sm={_this.state.txId ? 12 : 6}>
              <Box className="hover-shadow border-none mt-2">
                {!_this.state.isSweeping &&
                  !_this.state.success &&
                  !_this.state.errMsg && (
                    <div>
                      <Row>
                        <Col sm={12} className="text-center">
                          <h1 className="mb-1">
                            <FontAwesomeIcon
                              className="title-icon"
                              size="xs"
                              icon="arrow-circle-up"
                            />
                            <span>Sweep Wallet</span>
                          </h1>
                          <Text
                            id="WIF"
                            name="WIF"
                            placeholder="Enter a private key"
                            label="Private Key"
                            labelPosition="above"
                            onChange={_this.handleUpdate}
                            className="title-icon"
                            buttonRight={
                              <Button
                                icon="fa-qrcode"
                                onClick={_this.handleModal}
                              />
                            }
                          />
                          <Button
                            className="btn-primary"
                            text="Sweep"
                            onClick={() => _this.sweep(_this.state.WIF)}
                          />
                          <b>
                            <p className="qr-result">{_this.state.success}</p>
                          </b>
                        </Col>
                      </Row>
                    </div>
                  )}
                {_this.state.success && (
                  <div className="text-center">
                    <h3>
                      Sweeping complete. Check your balance and your tokens.
                      <br />
                      If you have multiple types of tokens on the paper wallet,
                      you'll need to scan it again.
                    </h3>
                    <p className="mt-2">
                      Transaction ID :
                      <a
                        href={`https://explorer.bitcoin.com/bch/tx/${
                          _this.state.txId
                        }`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {' '}
                        {_this.state.txId}
                      </a>
                    </p>

                    <Button
                      text="Back"
                      className="btn-primary mt-2"
                      style={{ color: 'white' }}
                      onClick={_this.handleResetState}
                    />
                  </div>
                )}
                {_this.state.errMsg && (
                  <>
                    <div className="text-center">
                      <h3 className="error-color">{this.state.errMsg}</h3>
                      <Button
                        text="Back"
                        className="btn-primary mt-2"
                        onClick={_this.handleResetState}
                      />
                    </div>
                  </>
                )}

                {_this.state.isSweeping && (
                  <div className="QRScanner-container">
                    <h3>Sweeping...</h3>
                  </div>
                )}
              </Box>
            </Col>
            <Col sm={3} />
          </Row>
        </Content>
        <SweepScanner
          onScan={_this.sweep}
          handleOnHide={_this.handleModal}
          show={_this.state.showScanner}
        />
      </>
    )
  }

  handleModal() {
    _this.setState({
      showScanner: !_this.state.showScanner
    })
  }
  handleUpdate(event) {
    const value = event.target.value
    _this.setState({
      [event.target.name]: value
    })
  }

  async sweep(data) {
    try {
      const isWIF = _this.validateWIF(data)
      if (!isWIF) {
        throw new Error('Not a WIF key')
      }
      _this.setState({
        showScanner: false,
        isSweeping: true
      })

      // Sweep start!
      const result = await _this.handleSweep(data)

      if (!result) throw new Error('Error making the sweep')

      _this.setState({
        success: true,
        isSweeping: false,
        txId: result
      })

      setTimeout(async () => {
        const tokens = await _this.props.bchWallet.listTokens()
        _this.props.setTokensInfo(tokens)
      }, 3000)
    } catch (error) {
      _this.setState({
        success: false,
        isSweeping: false,
        errMsg: error.message
      })
    }
  }

  async handleSweep(paperWIF) {
    try {
      // Get Wallet Info
      const walletInfo = getWalletInfo()
      const slpAddress = walletInfo.slpAddress
      const WIFFromReceiver = walletInfo.privateKey

      if (!slpAddress || !WIFFromReceiver) {
        throw new Error(
          'You need to have a registered wallet to make a token sweep'
        )
      }

      // Importing library
      const SweeperLib = typeof window !== 'undefined' ? window.Sweep : null
      if (!SweeperLib) throw new Error('Sweeper Library not found')

      // Get a handle on the instance of bch-js being used by gatsby-ipfs-web-wallet.
      const bchjs = _this.props.bchWallet.bchjs

      // Instancing the library
      const sweeperLib = new SweeperLib(paperWIF, WIFFromReceiver, bchjs)
      await sweeperLib.populateObjectFromNetwork()

      // console.log(
      //   `paper wallet UTXOs: ${JSON.stringify(
      //     sweeperLib.UTXOsFromPaperWallet.tokenUTXOs,
      //     null,
      //     2
      //   )}`
      // )

      // Constructing the sweep transaction
      const transactionHex = await sweeperLib.sweepTo(slpAddress)

      // return transactionHex

      // Broadcast the transaction to the network.
      const txId = await sweeperLib.blockchain.broadcast(transactionHex)
      return txId
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  handleResetState() {
    _this.setState({
      success: false,
      facingMode: 'environment',
      isSweeping: false,
      txId: '',
      errMsg: ''
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

Sweep.propTypes = {
  onError: PropTypes.func,
  onScan: PropTypes.func,
  bchWallet: PropTypes.object, // get minimal-slp-wallet instance
  setTokensInfo: PropTypes.func
}

export default Sweep
