var express = require('express');
var router = express.Router();
var productHelper=require('../helpers/product-helpers')
const {home,postLogin,viewProduct,addproductGet,addproductPost,deleteproductGet,editproductGet,editproductPost,userView,blockuserGet,unblockuserGet,
    categoryGet,categoryPost,deletecategoryGet,editcategoryGet,editcategoryPost,stockGet,editstockGet
    ,bannerGet,editstockPost,editbannerPost,editbannerGet,orderGet,cancellorderGet,shipedorderGet,deliverorderGet,offerGet,addcouponPost,logoutGet
    ,addbannerGet,addbannerPost,deleteBannerGet,blockbannerGet,unblockbannerGet,addcouponGet,vieworderedproductGet}=require('../controllers/admin')

    const multer=require('multer')
    const multerStorage = multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, "./public/product-images");
        },
        filename: function (req, file, cb) {
          cb(null, Date.now() + '-' + file.originalname)
        }
      })
      const uploadMultiple = multer({ storage: multerStorage }).fields([{ name: 'image', maxCount: 1 }, { name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }, { name: 'image3', maxCount: 1 }])
      const uploadSingle = multer({ storage: multerStorage }).fields([{ name: 'banner', maxCount: 1 }])
/*GET login*/
router.get('/', home)
/*POST login*/
router.post('/login',postLogin)
/*GET view products*/
router.get('/view',viewProduct)
/*GET add-product*/
router.get('/add-product',addproductGet)
/*POST add-product*/
router.post('/add-product',uploadMultiple,addproductPost)
/*GET delete-product*/
router.get('/delete-product/:id',deleteproductGet)
/*GET edit-product*/
router.get('/edit-product/',editproductGet)
/*POST edit-product*/
router.post('/edit-product/:id',uploadMultiple,editproductPost)
/*----USER----*/
router.get('/view-users',userView)
/*GET block-user*/
router.get('/block-user',blockuserGet)
/*GET unblock-user*/
router.get('/unblock-user',unblockuserGet)
/*GET add-category*/
router.get('/add-categorys',categoryGet)
/*POST add-category*/
router.post('/add-categorys',categoryPost)
/*GET delete-category*/
router.get('/delete-category/:id',deletecategoryGet)
/*GET edit-category*/
router.get('/edit-category',editcategoryGet)
/*POST edit-category*/
router.post('/edit-category',editcategoryPost)
/*GET stock*/
router.get('/stock',stockGet)
/*GET edit-stock*/
router.get('/edit-stock',editstockGet)
/*POST edit-stock*/
router.post('/edit-stock',editstockPost)
/*GET banner*/
router.get('/banner',bannerGet)
/*GET edit-banner*/
router.get('/edit-banner',editbannerGet)
/*POST banner*/
router.post('/edit-banner',uploadSingle,editbannerPost)
/*GET orders*/
router.get('/orders',orderGet)
/*GET cancel-order*/
router.get('/cancel-order',cancellorderGet)
/*GET shipped-order*/
router.get('/shipped-order',shipedorderGet)
/*GET deliver-order*/
router.get('/deliver-order',deliverorderGet)
/*GET offers*/
router.get('/ofers',offerGet)
/*GET add-coupon*/
router.get('/ad-coupon',addcouponGet)
/*POST addcoupon*/
router.post('/adcoupon',addcouponPost)
/*GET logout*/
router.get('/logout',logoutGet)
/*GET add-banner*/
router.get('/add-banner',addbannerGet)
/*POST add-banner */
router.post('/add-banner',uploadSingle,addbannerPost)
/*GET delete-banner*/
router.get('/delete-banner',deleteBannerGet)
/*GET block-banner*/
router.get('/block-banner',blockbannerGet)
/*GET unblock-banner*/
router.get('/unblock-banner',unblockbannerGet)
/*GET view-orderd-products*/
router.get('/vieworder-products',vieworderedproductGet)

module.exports = router;
