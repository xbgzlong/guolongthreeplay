<template>
	<div class="home-page">
		<div class="water-background my-animation-slide-top">
			<div class="waveWrapper waveAnimation">
				<div class="waveWrapperInner bgTop">
					<div class="wave waveTop"></div>
				</div>
				<div class="waveWrapperInner bgMiddle">
					<div class="wave waveMiddle"></div>
				</div>
				<div class="waveWrapperInner bgBottom">
					<div class="wave waveBottom"></div>
				</div>
			</div>
			<div class="title">
				<span class="fs-26 p-tb-15 fw-800">化腐朽为神奇</span>
				<span class="fs-20 p-tb-15">这里是threePlay</span>
			</div>
		</div>
		<div class="BasicCase">
			<div class="content-layout">
				<div>
					<el-row :gutter="20" class="case-content">
						<!-- :class="{ 'my-animation-slide-top': index % 2 !== 0, 'my-animation-slide-bottom': index % 2 === 0 }" -->
						<el-col :lg="8" :md="8" :sm="12" :xs="24" v-for="(i, index) in articleList || []" :key="index"
							class="case-list">
							<div class="case-list-item card">
								<div class="card-detail">
									<div class="bg-img" @click="goPage(i.path)">
										<el-image v-if="!!i.img && i.tag == 'three'" class="img"
											:src="require(`@/examples/screenshots/${i.img}`)" />
										<el-image v-else class="img" :src="require(`@/assets/images/none.svg`)" />
									</div>

									<div class="content-detail">
										<div class="publish-date">
											<span>
												<svg class="icon" aria-hidden="true" style="width: 16px; height: 16px; margin: 0 2px">
													<use xlink:href="#icon-a-013_tongzhi-40"></use>
												</svg>
												发布于：{{ i.date }}
											</span>

											<span>
												<svg class="icon" aria-hidden="true" style="
														width: 16px;
														height: 16px;
														margin: 0 2px;
														margin-left: 15px;
													">
													<use xlink:href="#icon-biaoqian"></use>
												</svg>
												{{ i.tag }}
											</span>
										</div>
										<div class="detail-title Article-title">
											{{ i.title }}
										</div>
										<div class="description">
											<p class="overflowClip_2">{{ i.description }}</p>
										</div>
									</div>
								</div>
							</div>
						</el-col>
					</el-row>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { Message } from "element-ui";
export default {
	data() {
		return {
			articleList: [
				{
					title: "three官网案例1",
					date: "2023-09-21 11:10:00",
					description: ['animation/keyframes'],
					tag: "three",
					path: "/three/webgl_animation_keyframes",
					img: "webgl_camera.jpg",
					description: "纯CSS3超酷鼠标滑过、点击按钮样式",
				},
                {
					title: "three概念入门",
					date: "2023-09-21 11:10:00",
					description: ['animation/self'],
					tag: "three",
					path: "/three/webgl_animation_self",
					img: "webgl_camera.jpg",
				},
				{
					title: "three几何体认识",
					date: "2023-09-21 11:10:00",
					description: ['animation/self1'],
					tag: "three",
					path: "/three/webgl_animation_self1",
					img: "webgl_camera.jpg",
				},
                {
					title: "three滑轨场景",
					date: "2023-09-21 11:10:00",
					description: ['animation/three01_donghuachangjiang'],
					tag: "three",
					path: "/three/three01_donghuachangjiang",
					img: "webgl_camera.jpg",
				},
                {
					title: "three几何体进阶",
					date: "2023-09-21 11:10:00",
					description: ['animation/three02_jiheti'],
					tag: "three",
					path: "/three/three02_jiheti",
					img: "webgl_camera.jpg",
				},




                
				// {
				// 	title: "three官网案例",
				// 	date: "2023-09-21 11:10:00",
				// 	description: ['animation/keyframes'],
				// 	tag: "three",
				// 	path: "/three/webgl_animation_skinning_blending",
				// 	img: "webgl_animation_skinning_blending.jpg",
				// },
				// {
				// 	title: "three官网案例",
				// 	date: "2023-09-21 11:10:00",
				// 	description: ['animation/keyframes'],
				// 	tag: "three",
				// 	path: "/three/webgl_camera",
				// 	img: "webgl_camera.jpg",
				// },
				// {
				// 	title: "three官网案例",
				// 	date: "2023-09-21 11:10:00",
				// 	description: ['animation/keyframes'],
				// 	tag: "three",
				// 	path: "/three/webgl_camera_array",
				// 	img: "webgl_camera_array.jpg",
				// },
				// {
				// 	title: "webgl_camera_cinematic",
				// 	date: "2023-09-21 11:10:00",
				// 	description: "webgl_camera_cinematic",
				// 	tag: "three",
				// 	path: "/three/webgl_camera_cinematic",
				// 	img: "webgl_camera_cinematic.jpg",
				// }, {
				// 	title: "webgl_clipping",
				// 	date: "2023-09-21 11:10:00",
				// 	description: "webgl_clipping",
				// 	tag: "three",
				// 	path: "/three/webgl_clipping",
				// 	img: "webgl_clipping.jpg",
				// },
			],
		};
	},
	mounted() { },
	methods: {

		goPage(url) {
			window.open(url, "_blank");
		},
	},
};
</script>

<style lang="scss" scoped>
.home-page {
	.water-background {
		height: 300px;
		position: relative;
		// ========================水波纹=============================

		@keyframes move_wave {
			0% {
				transform: translateX(0) translateZ(0) scaleY(1);
			}

			50% {
				transform: translateX(-25%) translateZ(0) scaleY(0.55);
			}

			100% {
				transform: translateX(-50%) translateZ(0) scaleY(1);
			}
		}

		.my-el-image {
			width: 100%;
			height: 100%;
		}

		.waveWrapper {
			overflow: hidden;
			position: absolute;
			left: 0;
			right: 0;
			bottom: 0;
			top: 0;
			margin: auto;
		}

		.waveWrapperInner {
			position: absolute;
			width: 100%;
			overflow: hidden;
			height: 100%;
			bottom: -1px;
			// background-image: linear-gradient(-20deg, #00cdac 0%, #2e9e96 100%);

			background-repeat: repeat no-repeat;
			background-position: 0 bottom;
			background-size: 100% 100%;
			background-image: url("../assets/images/LearningDocument.jpg");
		}

		.bgTop {
			z-index: 15;
			opacity: 0.5;
		}

		.bgMiddle {
			z-index: 10;
			opacity: 0.75;
		}

		.bgBottom {
			z-index: 5;
		}

		.wave {
			position: absolute;
			left: 0;
			width: 200%;
			height: 100%;
			background-repeat: repeat no-repeat;
			background-position: 0 bottom;
			transform-origin: center bottom;
		}

		.waveTop {
			background-image: url("../assets/images/wave-top.png");
			background-size: 50% 100px;
		}

		.waveAnimation .waveTop {
			animation: move_wave 20s linear infinite;
		}

		.waveMiddle {
			background-size: 50% 120px;
			background-image: url("../assets/images/wave-mid.png");
		}

		.waveAnimation .waveMiddle {
			animation: move_wave 10s linear infinite;
		}

		.waveBottom {
			background-size: 50% 100px;
			background-image: url("../assets/images/wave-bot.png");
		}

		.waveAnimation .waveBottom {
			animation: move_wave 15s linear infinite;
		}

		// ===========================================================

		.title {
			z-index: 999999;
			position: relative;
			height: 100%;
			width: 100%;
			animation: zoomIn 0.8s ease-in-out;
			display: flex;
			padding: 15px;
			width: 60%;
			margin: 0 auto;
			align-items: center;
			// justify-content: center;
			flex-direction: column;
			color: #fff;
			align-items: center;
			justify-content: center;
		}
	}

}

.BasicCase {
	height: auto;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;

	.content-layout {
		height: auto;
		width: 100%;
		height: auto;
		display: flex;
		// flex: 1 auto;
		padding: 0 15px;

		.case-title-more {
			display: flex;
			align-items: center;
			justify-content: space-between;
			color: #848484;
			border-bottom: 1px dashed #acacac87;
			font-weight: bold;
			font-size: 18px;
			padding: 10px 0;
			margin: 0 10px;
		}

		.case-content {
			margin-left: 0 !important;
			margin-right: 0 !important;
			width: 100%;

			.case-list {
				font-size: 20px;
				margin: 15px 0;

				.case-list-item {
					height: 300px;
					padding: 0;
					overflow: hidden;

					.card-detail {
						display: flex;
						flex-direction: column;
						height: 100%;

						.bg-img {
							width: 100%;
							height: 70%;
							overflow: hidden;

							.img {
								width: 100%;
								height: 100%;
								transition: transform 0.8s ease-in-out;

								/* 图片缩放过渡效果 */
								&:hover {
									transform: scale(1.1);
								}
							}
						}

						.content-eye {
							z-index: 2;
							position: absolute;
							right: 0px;
							background: #0000001f;
							top: 0;
							width: 50px;
							height: 50px;
							border-bottom-left-radius: 50px;
							transition: all 0.5s ease-in-out;

							// &:hover {
							// 	width: 100%;
							// 	height: 70%;
							// 	border-bottom-left-radius: 0px;
							// }
							.eye {
								position: absolute;
								right: 6px;
								top: 6px;
							}
						}

						.content-detail {
							flex: 1;
							display: flex;
							flex-direction: column;

							.publish-date {
								padding: 10px 5px;
								font-size: 14px;
								color: #848484;
							}

							.detail-title {
								font-weight: bold;
								padding: 0 5px;
								font-size: 16px;
							}

							.description {
								padding: 10px 5px;
								font-size: 14px;
								color: #848484;
								display: flex;
							}
						}
					}
				}
			}
		}
	}
}

// 头部图片自适应============================================
$sm: 920px+30px !default;
/* 在这里，我们定义 CSS @media 查询来设置不同宽度范围的网页样式 */
/* 当屏幕宽度大于等于769px时 */
@media only screen and (min-width: $sm) {

	/* 在这里，我们可以设置大屏幕下的网页样式 */
	.BasicCase {
		padding: 15px calc((100% - 1220px) / 2);

		.aside-content {
			padding-left: 15px;
		}
	}
}

/* 当屏幕宽度大于等于481px且小于等于769px时 */
@media (max-width: 768px) and (min-width: 481px) {
	/* 在这里，我们可以设置中等屏幕下的网页样式 */
}

/* 当屏幕宽度小于等于769px时 */
@media only screen and (max-width: $sm) {
	.BasicCase {
		padding: 15px;

		.content-layout {
			flex-direction: column;

			.recent-posts {
				width: 100%;
			}

			.aside-content {
				width: 100%;
			}
		}
	}
}
</style>
