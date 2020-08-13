import React from 'react'
import { Row, Col, Button } from 'adminlte-2-react'

// const BchWallet = typeof window !== 'undefined' ? window.SlpWallet : null

class TXHistory extends React.Component {
  constructor (props) {
    super(props)

    this.walletInfo = props.walletInfo
    console.log('constructor walletInfo: ', props.walletInfo)
  }

  render () {
    return (
      <Row>
        <Col sm={12} className='text-center mt-2 mb-2'>
          <Button
            text='Get TX History'
            type='primary'
            className='btn-lg'
            onClick={this.handleGetTxHistory}
          />
        </Col>
      </Row>
    )
  }

  // This event handler would use the minimal-slp-wallet-web library to retrieve
  // the transaction history for the address.
  async handleGetTxHistory () {
    try {
      console.log('Entering handleGetTxHistory()')
    } catch (err) {
      console.error(
        'Error in gatsby-plugin-bch-tx-history/handleGetTxHistory(): ',
        err
      )
    }
  }
}

export default TXHistory
