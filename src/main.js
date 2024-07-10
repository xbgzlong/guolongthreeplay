import Vue from 'vue'

import Cookies from 'js-cookie'

import Element from 'element-ui'

import router from './router'

import '@/assets/styles/element-variables.scss'
import '@/assets/styles/index.scss' // global css
import '@/assets/styles/base.scss' // base css
import '@/assets/fonts/iconfont.css'
import '@/assets/styles/animation.css' // animation css

import App from './App'

Vue.use(Element, {
	size: Cookies.get('size') || 'medium' // set element-ui default size
})

Vue.config.productionTip = false

new Vue({
	el: '#app',
	router,
	render: h => h(App)
})
