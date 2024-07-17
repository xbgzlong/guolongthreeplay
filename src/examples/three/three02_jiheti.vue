<template>
	<div>
		<div id="container" @click="containerClick"></div>
	</div>
</template>

<script>
import * as THREE from "three";
// 导入控制器
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// 引入房间环境，创建一个室内环境
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
// 导入性能监视器
import Stats from 'three/examples/jsm/libs/stats.module.js';
// 导入gltf载入库、模型加载器
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
// 引入模型解压器
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
//GUI界面
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
// 动画库
import gsap from 'gsap';
// import func from 'vue-editor-bridge';
export default {
	data() {
		return {
            ismove:true,
            animateMove:null,// 移动动画 
            animateRotation:null,// 旋转动画 
			container: null, //界面需要渲染的容器
			scene: null,	// 场景对象
			camera: null, //相机对象
			renderer: null, //渲染器对象
			controller: null,	// 相机控件对象
			stats: null,// 性能监听器
			mixer: null,//动画混合器
			model: null,//导入的模型
            boxGeometry:null,// 几何体对象
            cube:null,// 物体对象
			clock: new THREE.Clock()// 创建一个clock对象，用于跟踪时间
		};
	},
	mounted() {
		this.init()
		// this.animate()  //如果引入了模型并存在动画，可在模型引入成功后加载动画
		 window.addEventListener("resize", this.onWindowSize)
	},
	beforeUnmount() {
		console.log('beforeUnmount===============');
		// 组件销毁时置空
		this.container = null
		this.scene = null
		this.camera = null
		this.renderer = null
		this.controller = null
        this.boxGeometry = null;
		this.stats = null
		this.mixer = null
        this.cube = null;
		this.model = null//导入的模型
	},
	methods: {
		/**
		 * @description 初始化
		 */
		init() {
			this.container = document.getElementById('container')
            // 添加场景
			this.setScene()
            // 添加摄像机
			this.setCamera()
            // 添加物体
            this.setCube();
            // 添加渲染器
			this.setRenderer()
            // 轨道控制器
			this.setController()
            // 动画渲染
            this.setGsap();
            this.setRender();
            // 添加辅助坐标系统，
            this.setAxes();
            // 增加界面调试工具
            this.setGUI()
			// this.addHelper()
			// this.setPMREMGenerator()
			// this.setLight()
			// this.setGltfLoader()
			// this.addStatus()
		},
		/**
		 * @description 创建场景
		 */
		setScene() {
            this.scene = new THREE.Scene();
		},
		/**
		 * @description 创建相机
		 */
		setCamera() {
			// 第二参数就是 长度和宽度比 默认采用浏览器  返回以像素为单位的窗口的内部宽度和高度
			this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 1, 100)
			// 设置相机位置
			this.camera.position.set(15, 15, 15)
			// 设置摄像头宽高比例
			// this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
			// 设置摄像头投影矩阵
			// this.camera.updateProjectionMatrix();
			// 设置相机视线方向
			this.camera.lookAt(new THREE.Vector3(0, 0, 0))// 0, 0, 0 this.scene.position
			// 将相机加入场景
			this.scene.add(this.camera)
		},
        // 设计几何体
        setCube(){
            // 按照顶点 制作一个正方形
            this.boxGeometry = new THREE.BufferGeometry();
            let vertices = new Float32Array([
                1.0,1.0,1.0, 
                1.0,-1.0,1.0,
                1.0,1.0,-1.0, 
                1.0,-1.0,-1.0,
                1.0,1.0,-1.0,
                1.0,-1.0,1.0,
            ])
            this.boxGeometry.setAttribute('position',new THREE.BufferAttribute(vertices,3))
            let material = new THREE.MeshBasicMaterial({color:0xffff00});
            this.cube = new THREE.Mesh(this.boxGeometry,material);
            this.scene.add(this.cube);
            // 立方体
            const BoxGeometry = new THREE.BoxGeometry( 1, 1, 1, 2, 3, 4 ); 
            const BoxGeometrycube = new THREE.Mesh( BoxGeometry, new THREE.MeshBasicMaterial( {color: 0xffff00,wireframe:true} ) ); 
            BoxGeometrycube.position.set(0,5,0);
            this.scene.add( BoxGeometrycube );
            // 胶囊
            const CapsuleGeometry = new THREE.CapsuleGeometry( 1, 1, 4, 8 ); 
            const capsule = new THREE.Mesh( CapsuleGeometry, new THREE.MeshBasicMaterial( {color: 0x00ff00,wireframe:true} ) ); 
            capsule.position.set(0,7,0);
            this.scene.add( capsule );



            // 制作三角形矩阵
            for(let i=0;i<50;i++){
                // 创建一个顶点几何体
                const gg = new THREE.BufferGeometry();
                // 生成一个9个元素的数组
                const arr = new Float32Array(9)
                for(let j=0;j<9;j++){
                    // 给每个数组赋值 -2.5 可以产生负值
                    arr[j] = Math.random()*5 - 2.5;
                }
                // 给几何体顶点赋值
                gg.setAttribute('position',new THREE.BufferAttribute(arr,3))
                // 创建一个颜色对象
                let color = new THREE.Color(Math.random(),Math.random(),Math.random());
                // 创建一个颜色材质
                let material = new THREE.MeshBasicMaterial({color:color,transparent:true,opacity:Math.random()});
                // 添加物体
                let cube = new THREE.Mesh(gg,material);
                // 
                gsap.to(cube.position,{x:Math.random()*7 - 3.5,y:Math.random()*7-  3.5,z:Math.random()* - 3.5,duration:5,ease:'power1.inOut',repeat:-1,yoyo:true,delay:2,onComplete:function(){}});
                // 加入场景
                this.scene.add(cube);
            }
            
        },
        // 盒子点击事件
        containerClick(){
            console.log('点击')
            console.log('this.animateMove',this.animateMove)
            // if(this.ismove){
            //     this.animateMove.pause();
            // }else{
            //     this.animateMove.play();
            // }
            // this.ismove=!this.ismove;

            // 判断是否在运动状态
            if(this.animateMove.isActive()){
                // 暂停
                this.animateMove.pause();
            }else{
                // 恢复
                this.animateMove.resume();
            }
            // 全屏控制代码
            // if(!document.fullscreenElement){
            //     //进入全屏
            //     this.renderer.domElement.requestFullscreen()
            // }else{
            //     // 退出全屏
            //     document.exitFullscreen()
            // }
           
        },
		/**
		 * @description 创建渲染器
		 */
		setRenderer() {
			// 初始化渲染器
			this.renderer = new THREE.WebGLRenderer({
				antialias: true,// 设置抗锯齿
				logarithmicDepthBuffer: true,  // 是否使用对数深度缓存
			})
			// 设置渲染器宽高
			this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
			// 设置渲染器的像素比
			this.renderer.setPixelRatio(window.devicePixelRatio);
			// 是否需要对对象排序
			// this.renderer.sortObjects = false;
			// 将渲染器添加到页面
			this.container.appendChild(this.renderer.domElement);
             // 执行渲染
            this.renderer.render(this.scene, this.camera);
		},
		/**
		 * @description 添加创建轨道控制器
		 */
		setController() {
			this.controller = new OrbitControls(this.camera, this.renderer.domElement);
			// 控制缩放范围
			// this.controller.minDistance = 1;
			// this.controller.maxDistance = 5;

			//是否开启右键拖拽
			// this.controller.enablePan = false;

			// 阻尼（惯性）
			this.controller.enableDamping = true; //启用阻尼（惯性）
			this.controller.dampingFactor = 0.05; //阻尼惯性有多大

			// this.controller.autoRotate = true; //自动围绕目标旋转

			// this.controller.minAzimuthAngle = -Math.PI / 3; //能够水平旋转的角度下限。如果设置，其有效值范围为[-2 * Math.PI，2 * Math.PI]，且旋转角度的上限和下限差值小于2 * Math.PI。默认值为无穷大。
			// this.controller.maxAzimuthAngle = Math.PI / 3;//水平旋转的角度上限,其有效值范围为[-2 * Math.PI，2 * Math.PI],默认值为无穷大

			// this.controller.minPolarAngle = 1; //能够垂直旋转的角度的下限，范围是0到Math.PI，其默认值为0。
			// this.controller.maxPolarAngle = Math.PI - 0.1; //能够垂直旋转的角度的上限，范围是0到Math.PI，其默认值为Math.PI。

			// 修改相机的lookAt是不会影响THREE.OrbitControls的target的
			// 由于设置了控制器，因此只能改变控制器的target以改变相机的lookAt方向
			this.controller.target.set(0, 0.5, 0); //控制器的焦点
		},
        setGsap(){
            let n  = 0;
            this.animateMove = gsap.to(this.cube.position,{x:5,duration:5,ease:'power1.inOut',repeat:-1,yoyo:true,delay:2,onComplete:function(){
                n+=1;
                console.log('完成'+n+'次')
            }});
            this.animateRotation = gsap.to(this.cube.rotation,{x:Math.PI/4 +this.cube.position.x ,duration:5,yoyo:true,delay:2,ease:'power1.inOut',repeat:-1});
        },
          //  动画渲染 
        setRender(time){
            // this.cube.position.x = (time/1000) % 5;
            // if(this.cube.position.x && this.cube.position.x < 5){
            //     this.cube.scale.set(this.cube.position.x,this.cube.position.x,this.cube.position.x)
            //     this.cube.rotation.set(Math.PI/4 + this.cube.position.x,this.cube.position.x,this.cube.position.x)
            // }
            // if(this.cube.position.x == 5){
            //     this.cube.scale.set(1,1,1);
            //     this.cube.position.set(0,0,0);
            //     // this.setGsap();
            // }
            requestAnimationFrame(this.setRender);
            this.controller.update();
			// 重新渲染场景
			this.renderer.render(this.scene, this.camera);
        },
        // 添加辅助坐标轴
        setAxes(){
            const axesHelper = new THREE.AxesHelper(10);
            this.scene.add(axesHelper);
        },
        // 设置一个GUI 调试工具界面
        setGUI(){
            const gui = new GUI();
            const cubeDirFolder = gui.addFolder('物体');
            console.log('gui',gui)
            // 控制器属性
            gui.add(this.controller, 'dampingFactor', 0, 1).name('控制器阻尼').step(0.01);
            // Y轴位置
            cubeDirFolder.add(this.cube.position, 'y').min(0).max(5).name('Y值').step(0.1).onChange(value=>{
                console.log(value)
            }).onFinishChange(value=>{
                console.log(value)
            });
          
            // 调出画板
            let material = {
                color:0xffff00,
                fn:()=>{
                    this.containerClick()
                }
            }
            var that = this;
            cubeDirFolder.addColor(material,'color').name('颜色设置').onChange(value=>{
                // console.log(that.cube.material.color)
                 that.cube.material.color.set(value) 
            })
            cubeDirFolder.add(material,'fn').name('控制运动')
            cubeDirFolder.add(this.cube.material,'wireframe').name('控制材质')
              // 控制选项
            cubeDirFolder.add(this.cube,'visible').name('是否显示物体')
            cubeDirFolder.close()
        },
		/**
		 * @description 创建辅助坐标轴
		 */
		addHelper() {
			// 模拟相机视锥体的辅助对象
			let helper = new THREE.CameraHelper(this.camera);
			// this.scene.add(helper);

			//创建辅助坐标轴、轴辅助 （每一个轴的长度）
			let axisHelper = new THREE.AxesHelper(150);  // 红线是X轴，绿线是Y轴，蓝线是Z轴
			this.scene.add(axisHelper);

			// 坐标格辅助对象
			let gridHelper = new THREE.GridHelper(100, 30, 0x2C2C2C, 0x888888);
			this.scene.add(gridHelper);
		},
		/**
		 * @description 给场景添加环境光效果
		 */
		setPMREMGenerator() {
			// 预过滤的Mipmapped辐射环境贴图
			const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
			this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(this.renderer), 0.04).texture;
		},
		/**
		 * @description 设置光源
		 */
		setLight() {
			// 环境光
			const ambientLight = new THREE.AmbientLight(0x404040, 4);
			// this.scene.add(ambientLight);
			// 平行光
			const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
			// this.scene.add(directionalLight);

			// 点光源 - 照模型
			const test = new THREE.PointLight("#ffffff", 10, 2);
			// test.position.set(0, 0, 0);
			// this.scene.add(test);

			//点光源 - 辅助对象
			const testHelperMap = new THREE.PointLightHelper(test);
			// this.scene.add(testHelperMap);

		},
		/**
		 * @description 创建性能监听器
		 */
		addStatus() {
			// 创建一个性能监听器
			this.stats = new Stats();
			// 将性能监听器添加到容器中
			this.container.appendChild(this.stats.dom);
		},
		/**
		 * @description 监听屏幕的大小改变，修改渲染器的宽高，相机的比例
		 */
		// 窗口变化
		onWindowSize() {
			// 更新摄像头
			this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
			// 更新摄像机的投影矩阵
			this.camera.updateProjectionMatrix();
			//更新渲染器
			this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
			// 设置渲染器的像素比
			this.renderer.setPixelRatio(window.devicePixelRatio)
		},
      
		// 动画
		animate() {
			const delta = this.clock.getDelta();
			// mixer 动画更新
			if (this.mixer) {
				this.mixer.update(delta);
			}
			// 引擎自动更新渲染器
			requestAnimationFrame(this.animate);
			//update()函数内会执行camera.lookAt(x, y, z)
			this.controller.update(delta);
			// 更新性能监听器
			this.stats.update();
			// 重新渲染场景
			this.renderer.render(this.scene, this.camera);
		},
        // 自动旋转？
        renderRotateY(mesh){
            const spt = this.clock.getDelta()*1000;//毫秒
            console.log('两帧渲染时间间隔(毫秒)',spt);
            console.log('帧率FPS',1000/spt);
            this.renderer.render(this.scene, this.camera); //执行渲染操作
            mesh.rotateY(0.2);//每次绕y轴旋转0.01弧度
            requestAnimationFrame(this.renderRotateY(mesh));//请求再次执行渲染函数render，渲染下一帧
        },
		/**
		 * @description 添加创建模型
		 */
		setGltfLoader() {
			let that = this
			// 添加模型
			// 实例化gltf载入库
			const loader = new GLTFLoader();
			// 实例化draco载入库
			const dracoLoader = new DRACOLoader();
			// 添加draco载入库
			dracoLoader.setDecoderPath("/draco/gltf/");
			// 添加draco载入库
			loader.setDRACOLoader(dracoLoader);
			loader.load('/model/gltf/LittlestTokyo.glb', (gltf) => {
				that.model = gltf.scene
				that.model.position.set(1, 1, 0)
				that.model.scale.set(0.01, 0.01, 0.01)
				that.scene.add(that.model)
				// 绑定model的动画混合器
				// 动画混合器(AnimationMixer)是用于场景中特定对象的动画的播放器。
				// 当场景中的多个对象独立动画时，每个对象都可以使用同一个动画混合器。
				that.mixer = new THREE.AnimationMixer(that.model)
				// // 设置剪辑动画
				that.mixer.clipAction(gltf.animations[0]).play()
				// 执行动画
				that.animate();
			}, undefined, (err => {
				console.error(err)
			}))

		}
	},
};
</script>

<style>
#container {
	position: absolute;
	width: 100%;
	height: 100%;
}
</style>
