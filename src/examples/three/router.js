

//路由懒加载
export default {
	path: '/three',
	component: () => import('@/examples/index'),
	meta: { title: 'examples', icon: 'guide' },
	children: [
		{
			path: 'css2d_label',
			component: () => import('@/examples/three/css2d_label.vue'),
			hidden: true,
			meta: { title: 'css2d_label', icon: 'dashboard', affix: true }
		},
		{
			path: 'webgl_animation_multiple',
			component: () => import('@/examples/three/webgl_animation_multiple.vue'),
			hidden: true,
			meta: {
				noCache: true
			}
		},
		{
			path: 'webgl_animation_keyframes',
			component: () => import('@/examples/three/webgl_animation_keyframes.vue'),

			hidden: true,
			name: 'webgl_animation_keyframes',
			meta: { title: 'webgl_animation_keyframes', icon: 'dashboard', affix: true }
		},
		{
			path: 'webgl_animation_skinning_blending',
			component: () => import('@/examples/three/webgl_animation_skinning_blending.vue'),
			hidden: true,
			meta: {
				noCache: true
			}
		}, {
			path: 'webgl_animation_skinning_additive_blending',
			component: () => import('@/examples/three/webgl_animation_skinning_additive_blending.vue'),
			hidden: true,
			meta: {
				noCache: true
			}
		}, {
			path: 'webgl_camera',
			component: () => import('@/examples/three/webgl_camera.vue'),
			hidden: true,
			meta: {
				noCache: true
			}
		}, {
			path: 'webgl_camera_array',
			component: () => import('@/examples/three/webgl_camera_array.vue'),
			hidden: true,
			meta: {
				noCache: true
			}
		},
		{
			path: 'webgl_camera_cinematic',
			component: () => import('@/examples/three/webgl_camera_cinematic.vue'),
			hidden: true,
			meta: {
				noCache: true
			}
		},
		{
			path: 'webgl_clipping',
			component: () => import('@/examples/three/webgl_clipping.vue'),
			hidden: true,
			meta: {
				noCache: true
			}
		},
		// 地图
		{
			path: 'map/map3D',
			component: () => import('@/examples/three/map/map3D.vue'),
			hidden: true,
			meta: {
				noCache: true
			}
		},

        // 自建数据模型 学习 three 入门
        {
			path: 'webgl_animation_self',
			component: () => import('@/examples/three/webgl_animation_self.vue'),
			hidden: true,
			meta: {
				noCache: true
			}
		},
         // 自建数据1 学习画出几何体
         {
			path: 'webgl_animation_self1',
			component: () => import('@/examples/three/webgl_animation_self1.vue'),
			hidden: true,
			meta: {
				noCache: true
			}
		},
        // 自建数据1 系统学习滑轨动画
        {
			path: 'three01_donghuachangjiang',
			component: () => import('@/examples/three/three01_donghuachangjiang.vue'),
			hidden: true,
			meta: {
				noCache: true
			}
		},
        {
			path: 'three02_jiheti',
			component: () => import('@/examples/three/three02_jiheti.vue'),
			hidden: true,
			meta: {
				noCache: true
			}
		},
	]
};

