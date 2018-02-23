namespace GStats{
	export class TextureHook {
		
		private createdTextures:Array<any> = new Array<any>();
		public createdTexturesCount: number = 0;
		public maxTexturesCount:number = 0;

		public isInit:boolean = false;
		private realGLCreateTexture:Function = function(){};
		private realGLDeleteTexture:Function = function(){};

		private gl:any;
		
		constructor(_gl?:any) {	

			if(_gl ){
				
				if(_gl.__proto__.createTexture){
					this.gl = _gl;
					this.realGLCreateTexture = _gl.__proto__.createTexture;
					this.realGLDeleteTexture = _gl.__proto__.deleteTexture;

					//replace to new function
					_gl.__proto__.createTexture = this.fakeGLCreateTexture.bind(this);
					_gl.__proto__.deleteTexture = this.fakeGLDeleteTexture.bind(this);
					
					this.isInit = true;

					console.log("[TextureHook] GL was Hooked!");
				}

			} else {
				console.error("[TextureHook] GL can't be NULL");
			}
		}

		public get currentTextureCount():number{
			return this.createdTexturesCount;
		}

		private fakeGLCreateTexture():any {
			
			var texture = this.realGLCreateTexture.call(this.gl);
			
			this.createdTextures.push(texture);// ++;
			this.createdTexturesCount = this.createdTextures.length; 
			
			this.maxTexturesCount = Math.max(this.createdTexturesCount, this.maxTexturesCount);

			//console.log("created:", this.createdTextures.length);
			return texture;
		}

		private fakeGLDeleteTexture(texture:any):void {

			var index:number = this.createdTextures.indexOf(texture);
			if(index > -1)
			{
				this.createdTextures = this.createdTextures.slice(index, 1);
				this.createdTexturesCount = this.createdTextures.length; 
				//console.log("deleted:", this.createdTextures.length);
			}

			this.realGLDeleteTexture.call(this.gl, texture);
		}
		public reset():void{
			this.createdTextures = new Array<any>();
			this.maxTexturesCount = 0;
			this.createdTexturesCount = 0;
		}
		public release():void{

			if(this.isInit){
				
				this.gl.__proto__.createTexture = this.realGLCreateTexture;
				this.gl.__proto__.deleteTexture = this.realGLDeleteTexture;
				
				console.log("[TextureHook] Hook was removed!");
			}

			this.isInit = false;
		}
	}
}