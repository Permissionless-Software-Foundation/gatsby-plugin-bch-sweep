/*
  This file is how you add new menu items to your site. It uses the Gatsby
  concept of Component Shadowing:
  https://www.gatsbyjs.org/blog/2019-04-29-component-shadowing/
  It over-rides he default file in the gatsby-theme-bch-wallet.
*/

import React from 'react'
import { Sidebar } from 'adminlte-2-react'
import Sweep from '../../components/sweep'

const { Item } = Sidebar

const menuComponents = []

menuComponents.push({
  key: 'Sweep',
  component: <Sweep key='Sweep' />,
  menuItem: <Item icon='fas-arrow-circle-up' key='Sweep' text='Sweep' />
})

export default menuComponents
