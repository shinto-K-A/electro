var productHelper = require('../helpers/product-helpers')
var adminHelper = require('../helpers/admin-helpers')
var userHelpers = require('../helpers/user-helpers')

const adminEmail = 'shinto@gmail.com'
const adminPassword = '123'




module.exports = {


    home: async function (req, res, next) {
        res.header("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0")
        let User = req.session.admin;
        let totalOrders = await adminHelper.getTotalOrders()
        let totalProducts = await adminHelper.getAllProductCount()
        let salesData = await adminHelper.getAllSales()
        let TotalUsers = await adminHelper.getTotalUsers()
        let yearly = await adminHelper.getYearlySalesGraph();
        let monthly = await adminHelper.getMonthlySalesGraph();
        let daily = await adminHelper.getDailySalesGraph();




        console.log(daily, '2222222222222222222222222222222222222222222222222');



        // console.log(salesData,'kkkkkkkkkkkkkkkkkkkklllllllllll');


        if (User) {
            res.render('admin/landing', { layout: 'admin-layout', totalOrders, totalProducts, salesData, TotalUsers, daily, yearly, monthly })
        }//already loged in annengil home pageill pookum
        else { res.render('admin/login', { layout: null }) }
    },
    postLogin: (req, res) => {
        const userData = { email, password } = req.body
        if (email === adminEmail && password === adminPassword) {
            req.session.admin = userData
            res.render('admin/landing', { layout: 'admin-layout' })
        }
        else {
            console.log("error")
            res.redirect('/admin')
        }


    },
    viewProduct:async function (req, res, next) {


        res.header("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0")
       await productHelper.getAllproducts().then(async(products) => {
            let count = 0
            products.forEach(products => {
        count++
    });
    let pageCount = await userHelpers.paginatorCountFive(count)
    products = await userHelpers.getFiveProducts(req.query.id)

    if (req.query.minimum) {
        let minimum = req.query.minimum.slice(1)
        let maximum = req.query.maximum.slice(1)
        let arr = []
        products = await productHelper.getAllproducts()

        products.forEach(products => {
            
                arr.push(products)
            
        });
        products = arr;
    }
            
        
            res.render('admin/view-products', { layout: 'admin-layout', products,pageCount,count })
        })
    },
    addproductGet: async (req, res) => {
        res.header("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0")
        await productHelper.getAllCategories().then((response) => {

            res.render('admin/add-product', { layout: 'admin-layout', response })
        })
    },
    addproductPost: (req, res) => {
        req.body.image = req.files.image[0].filename
        req.body.image1 = req.files.image1[0].filename
        req.body.image2 = req.files.image2[0].filename
        req.body.image3 = req.files.image3[0].filename
        productHelper.addProduct(req.body)
        res.redirect('/admin/view')

    },
    deleteproductGet: (req, res) => {
        let userID = req.params.id
        productHelper.deleteProduct(userID).then((response) => {
            res.redirect('/admin/view')
        })

    },
    editproductGet: async (req, res) => {
        let product = await productHelper.getOneproduct(req.query.id)
        console.log(product);
        res.render('admin/edit-product', { layout: 'admin-layout', product });
    },
    editproductPost: async (req, res) => {
        let editid = req.params.id
        if (req.files.image == null) {
            Image1 = await productHelper.fetchImage1(editid)
        } else {
            Image1 = req.files.image[0].filename
        }
        if (req.files.image1 == null) {
            Image2 = await productHelper.fetchImage2(editid)
        } else {
            Image2 = req.files.image1[0].filename
        }
        if (req.files.image2 == null) {
            Image3 = await productHelper.fetchImage3(editid)
        } else {
            Image3 = req.files.image2[0].filename
        }
        if (req.files.image3 == null) {
            Image4 = await productHelper.fetchImage4(editid)
        } else {
            Image4 = req.files.image3[0].filename
        }
        req.body.image = Image1
        req.body.image1 = Image2
        req.body.image2 = Image3
        req.body.image3 = Image4
        productHelper.updateProduct(req.params.id, req.body).then(() => {
            console.log(req.params.id);
            let id = req.params.id
            res.redirect('/admin/view')

        })
    },
    categoryGet: (req, res) => {
        res.header("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0")
        productHelper.getAllCategories().then((categor) => {
            res.render('admin/add-category', { layout: 'admin-layout', categor,categorEror: req.session.errMsg })
            req.session.errMsg=null

        })

    },
    categoryPost: (req, res) => {
        productHelper.addCategory(req.body).then((response) => {
            if(response.add){
                res.redirect('/admin/add-categorys')

            }
            else{
                req.session.errMsg=response.erorMsg
                res.redirect('/admin/add-categorys')
                
            }
            

        })
    },
    deletecategoryGet: (req, res) => {
        let cateID = req.params.id
        productHelper.deleteCategory(cateID).then((response) => {
            res.redirect('/admin/add-categorys')
        })

    },
    editcategoryGet: async (req, res) => {
        await productHelper.findoneCategory(req.query.id).then((response) => {
            res.render('admin/edit-category', { layout: 'admin-layout', response })
            console.log(response);
        })
    },
    editcategoryPost: (req, res) => {
        productHelper.editCategory(req.query.id, req.body).then((response) => {
            res.redirect('/admin/add-categorys')
        })
    },
    stockGet: (req, res) => {
        productHelper.getAllproducts().then((categor) => {
            res.render('admin/stock', { layout: 'admin-layout', categor })
        })
    },

    //ADMINS USER OPERATIONS//
    userView: (req, res) => {
        adminHelper.getallUsers().then((user) => {
            res.render('admin/view-user', { layout: 'admin-layout', user })
        })
    },
    blockuserGet: (req, res) => {
        let userId = req.query.id
        adminHelper.blockUser(userId).then((response) => {
            res.redirect('/admin/view-users')
        })

    },
    unblockuserGet: (req, res) => {
        let usersId = req.query.id
        adminHelper.unblockUser(usersId).then((response) => {
            res.redirect('/admin/view-users')
        })

    },
    editstockGet: (req, res) => {
        productHelper.getOneproduct(req.query.id).then((response) => {
            res.render('admin/edit-stock', { layout: 'admin-layout', response })

        })
    },
    editstockPost: (req, res) => {
        productHelper.updateStock(req.query.id, req.body).then((response) => {
            res.redirect('/admin/stock')

        })
    },
    bannerGet: (req, res) => {
        productHelper.getAllBannerAdmin().then((produc) => {


            res.render('admin/banner', { layout: 'admin-layout', produc })
        })
    },
    editbannerGet: (req, res) => {
        productHelper.getOneBanner(req.query.id).then((baners) => {
            res.render('admin/edit-banner', { layout: 'admin-layout', baners })


        })

    },
    editbannerPost: async(req, res) => {
       

            let edtid = req.query.id
            if (req.files.banner == null) {
                Image1 = await productHelper.fetchImageOne(edtid)
            } else {
                Image1 = req.files.banner[0].filename
            }
            req.body.banner = Image1
            productHelper.updateBanner(req.query.id, req.body).then(() => {
                res.redirect('/admin/banner')


            })
        
    },
    orderGet: async (req, res) => {
        







        let orders = await productHelper.getAllOrders()
        let count = 0
        orders.forEach(orders => {
        count++
    });
    let pageCount = await userHelpers.paginatorCount(count)
    orders = await userHelpers.getTenProducts(req.query.id)

    if (req.query.minimum) {
        let minimum = req.query.minimum.slice(1)
        let maximum = req.query.maximum.slice(1)
        let arr = []
        orders = await productHelper.getAllOrders()

        orders.forEach(orders => {
            
                arr.push(products)
            
        });
        orders = arr;
    }

        res.render('admin/all-orders', { layout: 'admin-layout', orders,pageCount,count })
    },
    cancellorderGet: (req, res) => {
        adminHelper.cancellOrder(req.query.id).then((response) => {
            if (response.change) {

                adminHelper.refund(req.query.id).then((response) => {
                    res.redirect('/admin/orders')

                })
            }

        })

    },
    shipedorderGet: (req, res) => {
        adminHelper.shipedOrder(req.query.id).then((response) => {
            res.redirect('/admin/orders')
        })
    },
    deliverorderGet: (req, res) => {
        adminHelper.deliveredOrder(req.query.id).then((response) => {
            res.redirect('/admin/orders')
        })

    },
    offerGet: (req, res) => {
        adminHelper.viewCoupens().then((coupen) => {
            console.log(coupen, 'jjjjjjjjjjjjjjjjjjjjj');
            res.render('admin/view-ofer', { layout: 'admin-layout', coupen, oferEror: req.session.Eror })
            req.session.Eror = null
        })

    },
    addcouponGet:(req,res)=>{
        res.render('admin/add-coupon',{layout:'admin-layout'})

    },
    addcouponPost: (req, res) => {
        console.log(req.body,'formmmmmmmmmmmm dataaaaaaaaa');
        adminHelper.addCoupon(req.body).then((response) => {
                if (response.status) {
                    req.session.Eror = response.message
                }

                res.redirect('/admin/ofers')
            })
    },
    logoutGet: (req, res) => {
        req.session.admin = null
        req.session.logIn = false;
        res.redirect('/admin')
    },
    addbannerGet:(req,res)=>{
        res.render('admin/add-banner',{layout:'admin-layout'})
    },
    addbannerPost:(req,res)=>{
        req.body.banner = req.files.banner[0].filename
        productHelper.addBanner(req.body)
        res.redirect('/admin/banner')

    },
    deleteBannerGet:(req,res)=>{
        productHelper.deleteBanner(req.query.id).then((response)=>{
            res.redirect('/admin/banner')
        })
    },
    blockbannerGet:(req,res)=>{
        productHelper.blockBanner(req.query.id).then((response)=>{
            res.redirect('/admin/banner')
        })
    },
    unblockbannerGet:async(req,res)=>{
        let banner=await productHelper.getAllBanner()
        if(banner){
            productHelper.blockFirst().then((response)=>{
                productHelper.unblockBanner(req.query.id).then((response)=>{
                    res.redirect('/admin/banner')

                })
            })
        }
        else{
            productHelper.unblockBanner(req.query.id).then((response)=>{
                res.redirect('/admin/banner')

            })

        }
    },
    vieworderedproductGet: async (req, res) => {

        await userHelpers.getOrderProducts(req.query.id).then((products) => {
            console.log(products, 'uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu');
            res.render('admin/view-ordered-product', { layout:'admin-layout',products })

        })


    },
    






}