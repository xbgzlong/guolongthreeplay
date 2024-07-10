'use strict'
const path = require('path')

function resolve(dir) {
	return path.join(__dirname, dir)
}

const CompressionPlugin = require('compression-webpack-plugin')

const name = process.env.VUE_APP_TITLE || '冠迅threejs环境开发屋' // 网页标题

const port = process.env.port || process.env.npm_config_port || 80 // 端口

// vue.config.js 配置说明
// 官方vue.config.js 参考文档 https://cli.vuejs.org/zh/config/#css-loaderoptions
// 这里只列一部分，具体配置参考文档
module.exports = {
	// 部署生产环境和开发环境下的URL。
	// 默认情况下，Vue CLI 会假设你的应用是被部署在一个域名的根路径上
	// 如果应用被部署在一个子路径上，你就需要用这个选项指定这个子路径。
	// 从 Vue CLI 3.3 起已弃用，请使用publicPath。
	// baseUrl :process.env.NODE_ENV === "production" ? "/" : "/",
	publicPath: process.env.NODE_ENV === 'production' ? '/' : '/',
	// 在npm run build 或 yarn build 时 ，生成文件的目录名称（要和baseUrl的生产环境路径一致）（默认dist）
	outputDir: 'dist',
	// 用于放置生成的静态资源 (js、css、img、fonts) 的；（项目打包之后，静态资源会放在这个文件夹下）
	assetsDir: 'static',
	// 是否开启eslint保存检测，有效值：ture | false | 'error'
	lintOnSave: process.env.NODE_ENV === 'development',
	// 如果你不需要生产环境的 source map，可以将其设置为 false 以加速生产环境构建。
	productionSourceMap: false,
	// webpack-dev-server 相关配置
	devServer: {
		// 服务配置
		host: '0.0.0.0',
		port: port,// 端口
		open: true,// 是否自动打开浏览器
		proxy: {// 代理
			// detail: https://cli.vuejs.org/config/#devserver-proxy
			[process.env.VUE_APP_BASE_API]: {// 代理路径
				// target: `http://127.0.0.1:8888/`,// 代理目标地址
				target: `https://mock.apifox.cn/m1/1980799-0-default`,
				changeOrigin: true // 允许跨域
				// pathRewrite: {// 重写路径
				//   ['^' + process.env.VUE_APP_BASE_API]: ''
				// }
			}
		},
		disableHostCheck: true
	},
	// 配置alias别名
	configureWebpack: {
		name: name,
		resolve: {
			alias: {
				'@': resolve('src')
			}
		},
		plugins: [
			// http://doc.ruoyi.vip/ruoyi-vue/other/faq.html#使用gzip解压缩静态文件
			new CompressionPlugin({
				cache: false, // 不启用文件缓存
				test: /\.(js|css|html)?$/i, // 压缩文件格式
				filename: '[path].gz[query]', // 压缩后的文件名
				algorithm: 'gzip', // 使用gzip压缩
				minRatio: 0.8 // 压缩率小于1才会压缩
			})
		]
	},
	// 在一些罕见的情况下，node-sass可能输出无效的源映射
	// 解决项目打包发布到线上，页面偶发性出现图标乱码问题
	css: {
		loaderOptions: {
			sass: {
				sassOptions: { outputStyle: 'expanded' },
			},
			scss: {
				additionalData: '@use "@/assets/styles/variables.scss" as *;',
			},
		},
	},
	chainWebpack(config) {
		config.plugins.delete('preload') // TODO: need test
		config.plugins.delete('prefetch') // TODO: need test

		// set svg-sprite-loader
		config.module
			.rule('svg')
			.exclude.add(resolve('src/assets/icons'))
			.end()
		config.module
			.rule('icons')
			.test(/\.svg$/)
			.include.add(resolve('src/assets/icons'))
			.end()
			.use('svg-sprite-loader')
			.loader('svg-sprite-loader')
			.options({
				symbolId: 'icon-[name]'
			})
			.end()

		config.module.rule('md')
			.test(/\.md/)
			.use('vue-loader')
			.loader('vue-loader')
			.end()
			.use('vue-markdown-loader')
			.loader('vue-markdown-loader/lib/markdown-compiler')
			.options({
				raw: true
			})
			.end()

		config.when(process.env.NODE_ENV !== 'development', config => {
			config
				.plugin('ScriptExtHtmlWebpackPlugin')
				.after('html')
				.use('script-ext-html-webpack-plugin', [{
					// `runtime` must same as runtimeChunk name. default is `runtime`
					inline: /runtime\..*\.js$/
				}])
				.end()

			config.optimization.splitChunks({
				chunks: 'all',
				cacheGroups: {
					libs: {
						name: 'chunk-libs',
						test: /[\\/]node_modules[\\/]/,
						priority: 10,
						chunks: 'initial' // only package third parties that are initially dependent
					},
					elementUI: {
						name: 'chunk-elementUI', // split elementUI into a single package
						test: /[\\/]node_modules[\\/]_?element-ui(.*)/, // in order to adapt to cnpm
						priority: 20 // the weight needs to be larger than libs and app or it will be packaged into libs or app
					},
					commons: {
						name: 'chunk-commons',
						test: resolve('src/components'), // can customize your rules
						minChunks: 3, //  minimum common number
						priority: 5,
						reuseExistingChunk: true
					}
				}
			})
			config.optimization.runtimeChunk('single'),
			{
				from: path.resolve(__dirname, './public/robots.txt'), // 防爬虫文件
				to: './' // 到根目录下
			}
		})
	}
}
