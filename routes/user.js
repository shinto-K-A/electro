var express = require('express');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
var userHelpers=require('../helpers/user-helpers')
const {homePage,viewLaptop,loginGet,loginPost,signUp,signupPost,logout,viewAcessory,
    viewCamera,singleproductGet,otpGet,postOtp,otppageGet,postconfirmOTP,addtocartGet,
    mycartGet,changequantityPost,removeitemPost,placeorderGet,placeorderPost,successGet,
    forgotpasswordGet,forgotpasswordPost,
    verifypaymentPost,changepasswordPost,profileGet,profilePost,removeadressPost,myorderGet,resetGet,checkoldpasswordPost,
    resetPost,vieworderedproductGet,cancellorderedproductGet,returnorderedproductGet,offerGet,coupenPost,addToWish,mywishGet,DeleteProductWish,errorGet}=require('../controllers/user')
    var paypal = require('paypal-rest-sdk');
paypal.configure({
        'mode': 'sandbox', //sandbox or live 
        'client_id': 'AeKupuL9mHMQYupSDgCVrhtgAdME6EfakdAs8QfATm6fG7hPVV_mxzOHFy4ipCwjhYqaRT1xF9DPn6Gz', // please provide your client id here 
        'client_secret': 'EG0VsX6KWQamdlsXfFQ2b2fYY0ERUGsqUHeWUnwTsnerdjV49xGBru10vlGjvnU-Dak3-tJqiT6o--74' // provide your client secret here 
      });


/* GET home page. */
router.get('/',homePage);
/*GET viewLaptops*/
router.get('/viewlaptop',viewLaptop)
/*GET viewproduct*/
router.get('/viewaccesory',viewAcessory)
/*GET viewproduct*/
router.get('/viewcamera',viewCamera)
/*GET login*/
router.get('/login',loginGet)
/*POST login*/
router.post('/login',loginPost)
/*GET signup*/
router.get('/signup',signUp)
/*POST signup*/
router.post('/signup', signupPost)
/*GET logout*/
router.get('/logout',logout)
/*GET singleproduct*/
router.get('/singleproduct',singleproductGet)
/*GET otp*/
router.get('/otp',otpGet)
/*POST otp*/
router.post('/otp',postOtp)
/*GET enter-otp*/
router.get('/enter-otp',otppageGet)
/*POST confirmotp*/
router.post('/confirmotp',postconfirmOTP)
/*GET add-to-cart*/
router.get('/add-to-cart/:id',addtocartGet)
/*GET my-cart*/
router.get('/my-cart',mycartGet)
/*POST /change-product-quantity*/
router.post('/change-product-quantity',changequantityPost)
/*POST remove-from-cart*/
router.post('/remove-item',removeitemPost)
/*GET place-order*/
router.get('/place-order',placeorderGet)
/*POST place-order*/
router.post('/place-order',placeorderPost)
/*GET success*/
router.get('/success',successGet)
/*GET forgot-password*/
router.get('/forgot-password',forgotpasswordGet)
/*POST forgot-password*/
router.post('/forgot-password',forgotpasswordPost)
/*POST change-password*/
router.post('/change-password',changepasswordPost)
/*POST verify-payment*/
router.post('/verify-payment',verifypaymentPost)
/*GET profile*/
router.get('/profile',profileGet)
/*POST profile*/
router.post('/profile',profilePost)
/*POST removeaddress*/
router.post('/removeaddress',removeadressPost)
/*GET /orders*/
router.get('/orders',myorderGet)
/*GET reset-password*/
router.get('/reset-password',resetGet)
/*POST /checkpassword*/
router.post('/checkpassword',checkoldpasswordPost)
/*POST reset-password*/
router.post('/reset-password',resetPost)
/*GET view-order-products*/
router.get('/view-order-products',vieworderedproductGet)
/*GET cancel-order-products*/
router.get('/cancel-order-products',cancellorderedproductGet)
/*GET return-order-products*/
router.get('/return-order-products',returnorderedproductGet)
/*GET offers*/
router.get('/offers',offerGet)
/*POST applycoupon*/
router.post('/coupon-verify',coupenPost)
/*GET wislist*/
router.get('/add-to-wishlist/:id',addToWish)
/*GET my-wish*/
router.get('/my-wish',mywishGet)
/*POST deleteFromWish*/
/*post*/
router.post('/deleteFromWish', DeleteProductWish)
/*GET error-page*/
router.get('/error-page',errorGet)



module.exports = router;
