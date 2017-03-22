/*  
add js to connecting to sql database at connection info user provides

*/

$(document).ready(function(){
	$('#export').click(function(){
		console.log(">>>>>>>>>");
		var img = $("canvas");
		convertCanvasToImage(img[0]);
	});
	function convertCanvasToImage(canvas) {
		var image = canvas.toDataURL("image/png");
		console.log(image);
		var aLink = document.createElement('a');
		var evt = document.createEvent("HTMLEvents");
		evt.initEvent("click", false, false);
		aLink.download = "picture.png";
		aLink.href = image;
		console.log(aLink);
		aLink.click();
	}
});

