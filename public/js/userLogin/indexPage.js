function addToCart(productId){
	$.ajax({
		url:'/add-to-cart/?productId='+productId,
		method:'get',
		success:(response)=>{
			if(response.status){
				if(response.cartData.ajaxCount){
					const swalToast = Swal.mixin({
						toast: true,
						iconColor: "red",
						customClass: { popup: "colored-toast" },
						showConfirmButton: false,
						timerProgressBar: true,
					  });
					  
					  swalToast.fire({
						title: "One",
						position: "bottom",
						timer: 5000,
						icon: "info",
					  });
					  
				let count =$('#cart-count').html()
				count=parseInt(count)+1
				$('#cart-count').html(count)
				Swal.fire({
					icon: 'success',
					title: 'Added to Cart',
					showConfirmButton: false,	
					timer: 1500
				  })
				if(document.getElementById('addedToCart'+productId)){
				document.getElementById('addedToCart'+productId).innerHTML=`<a  href="/cart" style="color:green ;    margin-left: auto !important; margin-right: auto !important;padding-top: 16px;height:55px;"> <i class="fa fa-check" aria-hidden="true" ></i> Go To Cart</a>`
				}
				document.getElementById('addTocartBtn'+productId).style.display='none'
				document.getElementById('addedToCart2'+productId).innerHTML=`<a href="/cart" style="color:green ;    margin-left: auto !important; margin-right: auto !important;"> <i class="fa fa-check" aria-hidden="true"></i> Go To Cart</a>`
				}
			}else{
				if(response.errMsg){
					$('#addedToCart'+productId).html(response.errMsg)
				}else{
				location.href='/login'
				}
			}
		}
	})
}
//<div  class="text-center" style="color:green ;"> <i class="fa fa-check" aria-hidden="true" ></i> added</a></div>
function addRemoveWishlist(productId){
	if(productId){
		if(document.getElementById('heartIcon2'+productId).style.color=='white'){
			addToWishlist(productId)
		}else{
			removeWishlist(productId)
		}
	}else{
		location.href='/login'
	}
	
}

function addToWishlist(productId){
	$.ajax({
		url:'/add-to-wishlist/?productId='+productId,
		method:'get',
		success:(response)=>{
			if(response.status){               
				$('#wishList-count').html(response.wishlistCount)
				if(document.getElementById('heartIcon'+productId)){
					document.getElementById('heartIcon'+productId).style.color='rgb(0, 115, 255)'
				}
				document.getElementById('heartIcon2'+productId).style.color='rgb(0, 115, 255)'
			}else{
				location.href='/login'
			}
		
		}
	})
}



function removeWishlist(productId){
	$.ajax({
	url:'/remove-wishlist/?productId='+productId,     
	method:'get',
	success:(response)=>{
	  if(response.status) {  
		$('#wishList-count').html(response.wishlistCount)
		if(document.getElementById('heartIcon'+productId)){
			document.getElementById('heartIcon'+productId).style.color='white'
		}
		document.getElementById('heartIcon2'+productId).style.color='white'
	  }else{
		location.href='/login'
	}
	 
	}
  })
}