import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Content, Row, Col, Box } from 'adminlte-2-react'
import 'gatsby-ipfs-web-wallet/src/components/qr-scanner/qr-scanner.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import QrReader from 'react-qr-reader'

let _this

class Sweep extends Component {
  constructor (props) {
    super(props)
    _this = this

    this.state = {
      success: false,
      facingMode: 'environment',
      isSweeping: false
    }

    // The library QrReader calls to the scan function constantly, 
    // sending null as a parameter if it does not read anything, 
    // so it's advisable to insert code inside a validation
    
    /* TODO: Integrate with npm library to sweep tokens */
    this.handleScan = async data => {
      //
      //   const bchjs = new BCHJS({ restURL: FULLSTACK_MAINNET_API_FREE })
      //   const rootSeed = await bchjs.Mnemonic.toSeed('scorpion like ten total bean venture boring discover half myself survey miss')
      //   const masterHDNode = bchjs.HDNode.fromSeed(rootSeed)
      //   const account = bchjs.HDNode.derivePath(masterHDNode, "m/44'/145'/0'")
      //   const change = bchjs.HDNode.derivePath(account, '0/0')
      //   const ECPair = bchjs.HDNode.toKeyPair(change)
      //   const wifFromReceiver = bchjs.ECPair.toWIF(ECPair)

      //   const slpSweeper = new SLPSweeper(wifFromReceiverPaper, wifFromReceiver)
      //   await slpSweeper.build()
      //   await slpSweeper.sweepTo(SlpAddress, BchAddress)
      // })()
      // this.setState({ isSweeping: false })
      if (data) {
        console.log(`Scanned data : ${data}`)
        this.setState({ isSweeping: true })
        /*
        *
        *  Sweeping
        */
        this.setState({
          success: true,
          isSweeping: false
        })
      }
    }

    this.handleError = err => {
      console.error(err)
      _this.props.onError ? _this.props.onError(err) : console.error(err)
    }
  }

  render () {
    return (
      <Content>
        <Row>
          <Col sm={3} />
          <Col sm={6}>
            <Box className='hover-shadow border-none mt-2'>
              {!this.state.isSweeping && !this.state.success && (
                <>
                  <Row>
                    <Col sm={12} className='text-center'>
                      <h1>
                        <FontAwesomeIcon
                          className='title-icon'
                          size='xs'
                          icon='arrow-circle-up'
                        />
                        <span>Sweep Wallet</span>
                      </h1>
                      <QrReader
                        delay={300}
                        onError={this.handleError}
                        onScan={this.handleScan}
                        facingMode={_this.state.facingMode}
                      />
                      <b>
                        <p className='qr-result'>{this.state.success}</p>
                      </b>
                    </Col>
                  </Row>
                </>
              )}
              {this.state.success && (
                <div className='QRScanner-container'>
                  <h3>
                    Sweeping complete. Check your balance and your tokens.
                  </h3>
                </div>
              )}
              {this.state.isSweeping && (
                <div className='QRScanner-container'>
                  <h3>Sweeping...</h3>
                </div>
              )}
            </Box>
          </Col>
          <Col sm={3} />
        </Row>
      </Content>
    )
  }

  handleChangeMode () {
    const mode = _this.state.facingMode === 'user' ? 'environment' : 'user'
    _this.setState({
      facingMode: mode
    })
  }
}

Sweep.propTypes = {
  onError: PropTypes.func,
  onScan: PropTypes.func
}

export default Sweep
