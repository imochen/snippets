#CodeSnippet

####less&sass mixins
source url : https://github.com/mytcer/xmixins

sass mixin 新增单位自动转换方法。
定义设计稿的尺寸后，只需要按照px切图即可。

```css
	.logo{
		width : px2rem(300);
		height : px2rem(300);
	}
	//这里的300直接是设计图上量出来的
```

####jQuery.cusScrollBar
create by : https://github.com/huzunjie


####getFlashVersion
可以用此方法来检测当前环境是否支持flash。
```javascript
@return {number} //返回-1表示没有检测到flash版本
```

####imgCompres
前端图片压缩，一般用于移动端上传前对图片进行简单处理


####mResize
根据页面大小，自动调整根字体的大小，以便更好的使用rem，多用于移动端。
部分小米机型不能重新计算，需要在页面ready之后手动触发一下 window 的 resize事件

####mframe
解决UI和数据分离的问题，demo下载后可修改 src/index/data.js 中得请求地址及参数测试效果。
