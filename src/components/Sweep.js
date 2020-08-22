  
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './qr-scanner.css'
import QrReader from 'react-qr-reader'

let _this

class Sweep extends Component {
  constructor (props) {
    super(props)
    _this = this

    this.state = {
      success: 'No Result',
      facingMode: 'environment',
      isSweeping: false,
    }

    /* TODO: Integrate with npm library to sweep tokens */
    this.handleScan = async data => {
      this.setState({ isSweeping: true })
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
      this.setState({ isSweeping: false })
      if (data) {
        this.setState({
          success: true
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
      <div className='QRScanner-container'>
        {!this.state.isSweeping && !this.state.success && <div><h3>Sweep Paper Wallet</h3>
        <h4>Facing Mode: {_this.state.facingMode}</h4>
        <button className='change-button' onClick={_this.handleChangeMode}>
          Change
        </button>
        <QrReader
          delay={300}
          onError={this.handleError}
          onScan={this.handleScan}
          facingMode={_this.state.facingMode}
        />
        <b>
          <p className='qr-result'>{this.state.success}</p>
        </b></div>}
        {this.state.success && <div className='QRScanner-container'><h3>Sweeping complete. Check your balance and your tokens.</h3></div>}
        {this.state.isSweeping && <div className='QRScanner-container'><h3>Sweeping...</h3></div>}
      </div>
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