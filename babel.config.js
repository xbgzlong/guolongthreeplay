module.exports = {
	presets: [
		// https://github.com/vuejs/vue-cli/tree/master/packages/@vue/babel-preset-app
		'@vue/cli-plugin-babel/preset'
	],
	'env': {
		'development': {
			// babel-plugin-dynamic-import-node插件只做一件事，将所有import()转换为require()。
			// 当你有大量的页面，这个插件可以显著提高热更新的速度。
			'plugins': ['dynamic-import-node']
		}
	}
}
