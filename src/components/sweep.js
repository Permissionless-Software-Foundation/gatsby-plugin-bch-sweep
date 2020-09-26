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

class Sweep extends Component {
  constructor(props) {
    super(props)
    _this = this

    this.state = {
      success: false,
      facingMode: 'environment',
      isSweeping: false,
      txId: '',
      errMsg: ''
    }

    // The library QrReader calls to the scan function constantly,
    // sending null as a parameter if it does not read anything,
    // so it's advisable to insert code inside a validation

    /* TODO: Integrate with npm library to sweep tokens */
    this.handleScan = async data => {
      if (data) {
        try {
          console.log(`Scanned data : ${data}`)

          // Validate Input
          const isWIF = _this.validateWIF(data)
          if (!isWIF) {
            throw new Error('Not a WIF key')
          }

          _this.setState({ isSweeping: true })

          // Sweep start!
          const result = await _this.handleSweep(data)

          if (!result) throw new Error('Error making the sweep')

          _this.setState({
            success: true,
            isSweeping: false,
            txId: result
          })
        } catch (error) {
          _this.setState({
            success: false,
            isSweeping: false,
            errMsg: error.message
          })
        }
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
                  )}
                {_this.state.success && (
                  <div className="text-center">
                    <h3>
                      Sweeping complete. Check your balance and your tokens.
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
      </>
    )
  }

  handleChangeMode() {
    const mode = _this.state.facingMode === 'user' ? 'environment' : 'user'
    _this.setState({
      facingMode: mode
    })
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

      // Instancing the library
      const sweeperLib = new SweeperLib(paperWIF, WIFFromReceiver)
      await sweeperLib.populateObjectFromNetwork()

      // console.log(
      //   `paper wallet UTXOs: ${JSON.stringify(
      //     sweeperLib.UTXOsFromPaperWallet.tokenUTXOs,
      //     null,
      //     2
      //   )}`
      // )

      if (sweeperLib.UTXOsFromPaperWallet.tokenUTXOs.length > 0) {
        // Extract the token IDs held by the apper wallet.
        const ids = sweeperLib.UTXOsFromPaperWallet.tokenUTXOs.map(
          x => x.tokenId
        )

        // Get the unique IDs
        const uniqueIds = this.uniq(ids)

        if (uniqueIds.length > 1) {
          throw new Error(
            'More than 1 token class on the paper wallet. The wallet can not handle that yet!'
          )
        }
      }

      // Constructing the sweep transaction
      const transactionHex = await sweeperLib.sweepTo(slpAddress)

      // return transactionHex

      // Broadcast the transaction to the network.
      const txId = await sweeperLib.broadcast(transactionHex)
      return txId
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  uniq(a) {
    return a.sort().filter(function(item, pos, ary) {
      return !pos || item !== ary[pos - 1]
    })
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
  onScan: PropTypes.func
}

export default Sweep
