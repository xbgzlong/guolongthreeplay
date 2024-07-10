<template>
	<div id="app">
		<router-view></router-view>
	</div>
</template>

<script>
import "dayjs/locale/zh-cn";
export default {
	name: "App",
};
</script>
<script src="./assets//fonts/iconfont.js"></script>

<style lang="scss">
// @import url('./assets//styles/md.css');
.icon {
	width: 1.5rem;
	height: 1.5rem;
	vertical-align: -0.15em;
	fill: currentColor;
	overflow: hidden;
}

#app {
	font-family: "楷体";
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	color: #2c3e50;
}

.md-siber {
	overflow: hidden;
	height: auto;

	.toc {
		position: fixed;
		right: 5%;
		top: 180px;
		/* bottom: 80px; */
		width: 300px;
		min-width: 300px;
		overflow: auto;
		background: #fff;
		border-radius: 10px;
		max-height: calc(100% - 300px);
		/* min-height: 320px; */
		/* height: 410px; */
		/* height: auto; */
		padding: 15px;
		transition: all 1s;
	}

	.tocScroll {
		top: 60px;
	}

	.dir {
		position: relative;
		padding-bottom: 8px;
		box-sizing: border-box;
	}

	#toc {
		margin: 0;
		padding-left: 0;
		box-sizing: border-box;
	}

	.sider {
		width: 2px;
		height: 100%;
		background: #eee;
		position: absolute;
		right: 0;
		top: 0;
		border-radius: 10px;
		margin: auto;
		bottom: 0;
	}

	.siderbar {
		display: flex;
		width: 100%;
		height: 20px;
		line-height: 2;
		background: orange;
		transition: all 0.1s;
	}

	li {
		height: 30px;
		box-sizing: border-box;
		list-style: none;
	}

	a {
		color: #333c;
		text-decoration: none;
		font-size: 16px;
		font-weight: 500;
		padding: 5px;
		background: #ffffff00;
		transition: all 0.5s;
		border-radius: 5px;
	}

	a.md-active {
		color: orange;
		/* font-size: 18px; */
		/* font-weight: 800; */
		background: #fff;
	}

	.li-1 {
		padding-left: 0px;
	}

	.li-2 {
		padding-left: 8px;
	}

	.li-3 {
		padding-left: 16px;
	}

	.li-4 {
		padding-left: 24px;
	}

	.li-5 {
		padding-left: 32px;
	}

	.li-6 {
		padding-left: 40px;
	}
}
</style>
