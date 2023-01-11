const productHelpers = require('../helpers/product-helpers');
var userHelpers = require('../helpers/user-helpers')


module.exports = {
    homePage: async (req, res) => {
        res.header(
            "Cache-Control",
            "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
        )
        logIn = req.session.user
        let cartCount = null
        let wishCount = null
        if (logIn) {
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            wishCount = await userHelpers.getWishCount(req.session.user._id)
        }
        
        let banner = await productHelpers.getAllBanner()

        res.render('user/index', { logIn, cartCount,wishCount,banner});
    },
    viewLaptop: async (req, res) => {
        logIn = req.session.user
        // let cartCount = null
        // let wishCount = null
        if (logIn) {
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            wishCount = await userHelpers.getWishCount(req.session.user._id)
        }
        else{
            cartCount=0
            wishCount=0
        }
        productHelpers.getLaptops().then((products) => {
            res.render('user/view-lap', { products, logIn, cartCount,wishCount })
        })
    },
    viewAcessory: async (req, res) => {
        // let cartCount = null
        // let wishCount = null
        logIn = req.session.user
        if (logIn) {
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            wishCount = await userHelpers.getWishCount(req.session.user._id)
        }
        else{
            cartCount=0
            wishCount=0
        }
        logIn = req.session.user
        productHelpers.getAcesory().then((products) => {
            res.render('user/view-accesory', { products, logIn, cartCount,wishCount })
        })

    },
    viewCamera: async (req, res) => {
        logIn = req.session.user
        // let cartCount = null
        // let wishCount = null
        if (logIn) {
            cartCount = await userHelpers.getCartCount(req.session.user.f_id)
            wishCount = await userHelpers.getWishCount(req.session.user._id)
        }
        else{
            cartCount=0
            wishCount=0
        }
        productHelpers.getCamera().then((products) => {
            res.render('user/view-accesory', { products, logIn, cartCount,wishCount })
        })


    },
    loginGet: (req, res) => {
        res.header(
            "Cache-Control",
            "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
        );

        if (req.session.loggedIn) {
            res.redirect('/')
        }

        else res.render('user/login', { layout: null })
    },
    loginPost: (req, res) => {
        res.header(
            "Cache-Control",
            "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
        );
        userHelpers.doLogin(req.body).then((response) => {
            if (response.status) {
                if (response.user.blocked) {
                    res.redirect('/login')
                }
                else {
                    req.session.loggedIn = true
                    req.session.user = response.user
                    res.redirect('/')
                }

            } else {
                res.redirect('/login')
            }
        })

    },
    signUp: (req, res) => {
        res.render('user/signup', { layout: null })
    },
    signupPost: (req, res) => {
        userHelpers.doSignup(req.body).then((response) => {
            if (response.status == false) {
                res.render('user/signup', { layout: null })
            }

            res.redirect('/login')

        })
    },
    logout: (req, res) => {
        req.session.destroy()
        res.redirect('/login')
    },
    singleproductGet: async (req, res) => {
        
            logIn = req.session.user
        //let products=await userHelpers.getCartProducts(req.session.user._id)
        // let cartCount = null
        // let wishCount = null
        if (logIn) {
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            wishCount = await userHelpers.getWishCount(req.session.user._id)
        }
        productHelpers.getOneproduct(req.query.id).then((response) => {
            res.render('user/single-product', { response, logIn, cartCount,wishCount })


        })
        
        
        
        
    },
    //Phone Number Providing
    otpGet: (req, res) => {
        res.render('user/enter-phone-otp', { layout: null })
    },
    //sending otp and show otp page
    let: signupData = 0,
    postOtp: (req, res) => {
        userHelpers.doOTP(req.body).then((response) => {
            if (response.status) {
                signupData = response.user;
                console.log(signupData)
                res.redirect('/enter-otp')

            }
            else {
                res.redirect('/otp')
            }
        })
        console.log(req.body);
    },
    otppageGet: (req, res) => {
        res.header(
            "Cache-Control",
            "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
        )
        res.render('user/enter-otp', { layout: null })
    },
    postconfirmOTP: (req, res) => {
        console.log(req.body)
        userHelpers.doOTPConfirm(req.body, signupData).then((response) => {
            if (response.status) {


                req.session.loggedIn = true;
                req.session.user = signupData;


                res.redirect('/')
            } else {
                res.redirect('/otpPage')
            }
        })
    },
    //ADD TO CART
    addtocartGet: (req, res) => {
        userHelpers.addtoCart(req.params.id, req.session.user._id).then(() => {
            res.json({ status: true })
        })
    },
    mycartGet: async (req, res) => {
        logIn = req.session.user
        let products = await userHelpers.getCartProducts(req.session.user._id)
        let totalValue = await userHelpers.getTotalAmount(req.session.user._id)
        // let cartCount = null
        // let wishCount = null
        if (logIn) {
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            wishCount = await userHelpers.getWishCount(req.session.user._id)
        }
        console.log(products);
        res.render('user/my-cart', { products, logIn, cartCount, totalValue, user: req.session.user._id,wishCount })
    },
    changequantityPost: (req, res, next) => {
        userHelpers.changeProductQuantity(req.body).then(async (response) => {
            response.total = await userHelpers.getTotalAmount(req.body.user)
            res.json(response)

        })

    },
    removeitemPost: (req, res) => {
        userHelpers.removeItem(req.body).then((response) => {
            res.json(response)
        })
    },
    placeorderGet: async (req, res) => {
        logIn = req.session.user
        cartCount = await userHelpers.getCartCount(req.session.user._id)
        adress = await userHelpers.AllAddress(req.session.user._id)
        //console.log(adress,'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk');
        wishCount = await userHelpers.getWishCount(req.session.user._id)

        let total = await userHelpers.getTotalAmount(req.session.user._id)
        res.render('user/place-order', { total, user: req.session.user, logIn, cartCount, adress,wishCount })
    },
    placeorderPost: async (req, res) => {
        let products = await userHelpers.getCartProductList(req.body.userId)
        if(req.session.amount){
            var totalPrice=req.session.amount

        }
        else{
            var totalPrice = await userHelpers.getTotalAmount(req.body.userId)

        }
        
        userHelpers.placeOrder(req.body, products, totalPrice).then((orderId) => {
            
            req.session.orderId=orderId
            //console.log(req.session.orderId,'jjjjjjjjjkllllllllllllll');
            if (req.body['paymentMethod'] == 'COD') {
                res.json({ codSuccess: true })
            }
            else if (req.body['paymentMethod'] === 'ONLINE') {
                //console.log(orderId,totalPrice,'generateeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee');
                userHelpers.generateRazorpay(orderId, totalPrice).then((response) => {
                    console.log(response,'raaaaaaaaaaaaaaaaaaaaa');
                    response.razorPay = true
                    res.json(response)

                })
            } else if (req.body['paymentMethod'] === 'PAYPAL') {
                console.log("fcghjnkmmmmmmmmmmmmmmmmmmmmmmmmmmmmlm,",totalPrice);
                var payment = {
                    "intent": "sale",
                    "payer": {
                        "payment_method": "paypal"
                    },
                    "redirect_urls": {
                        "return_url": "http://localhost:3000/success",
                        "cancel_url": "http://shinto.cf"
                    },
                    "transactions": [{
                        "amount": {
                            "currency": "USD",
                            "total": totalPrice
                        },
                        "description":orderId
                    }]
                };

                userHelpers.createPay(payment).then((transaction) => {
                    //console.log(payment,"-------------",transaction);
                    var id = transaction.id;
                    var links = transaction.links;
                    var counter = links.length;
                    while (counter--) {
                        console.log(orderId,'counterrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr');
                        if (links[counter].rel === 'approval_url') {
                            //console.log(transaction,'transactionnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn');
                            transaction.pay = true
                            transaction.linkto = links[counter].href
                            transaction.orderId = orderId
                            userHelpers.changePaymentStatus(orderId).then(() => {
                                res.json(transaction)
                            })
                        }
                    }
                })
            }

        })
        // console.log(req.body)
        console.log(req.body);


    },
    successGet: async (req, res) => {
        logIn = await req.session.user
        orderId= req.session.orderId
        orderDetail=await userHelpers.getSingleOrder(orderId)
        console.log(orderDetail,'ppppppppppoooooooooooolllllllllllll');
        cartCount = await userHelpers.getCartCount(req.session.user._id)
        wishCount = await userHelpers.getWishCount(req.session.user._id)

        res.render('user/success', { logIn, cartCount,wishCount,orderDetail })
    },
    forgotpasswordGet: (req, res) => {
        res.render('user/forgot-password', { layout: null })
    },
    forgotpasswordPost: (req, res) => {
        userHelpers.conformUser(req.body).then((response) => {
            if (response.status) {
                // console.log(response.user);
                user = response.user
                res.render('user/new-password', { layout: null, user })
            }
            else {
                res.redirect('/forgot-password')
            }
        })
    },
    changepasswordPost: async (req, res) => {
        //console.log(user,'qqqqqqqqqqqqqqqwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww');

        userHelpers.resetPassword(req.body, user).then((response) => {
            res.redirect('/login')
        })

    },
    verifypaymentPost: (req, res) => {
        //console.log(req.body);
        userHelpers.verifyPayment(req.body).then(() => {
            console.log(req.body['order[receipt]'],"------------------------------",req.body);
            userHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {

                res.json({ status: true })
                console.log('PAYMENT SUSSSSSSSSSSSSSSS');

            })

        }).catch((err) => {
            res.json({ status: false, errMsg: '' })
        })

    },
    profileGet: async (req, res) => {
        logIn = req.session.user
        cartCount = await userHelpers.getCartCount(req.session.user._id)
        adress = await userHelpers.AllAddress(req.session.user._id)
        wishCount = await userHelpers.getWishCount(req.session.user._id)
        UserWallet= await userHelpers.findUser(req.session.user._id)
        res.render('user/profile', { logIn, cartCount, adress,wishCount,UserWallet })
    },
    profilePost: (req, res) => {
        user = req.session.user
        userHelpers.addAddress(req.body, user._id).then(() => {
            res.redirect('/')
        })


    },
    removeadressPost: async (req, res, next) => {
        deleteAddress = await userHelpers.deleteAddress(req.body.addressId, req.session.user._id)
        res.json({ delete: true })
    },
    myorderGet: async (req, res) => {
        logIn = req.session.user
        cartCount = await userHelpers.getCartCount(req.session.user._id)
        let orders = await productHelpers.getmyOrders(req.session.user._id)
        wishCount = await userHelpers.getWishCount(req.session.user._id)
        res.render('user/my-order', { orders, logIn, cartCount,wishCount })
    },
    resetGet: async (req, res) => {
        logIn = await req.session.user
        cartCount = await userHelpers.getCartCount(req.session.user._id)
        wishCount = await userHelpers.getWishCount(req.session.user._id)
        res.render('user/old-password', { logIn, cartCount,wishCount })
    },
    checkoldpasswordPost: (req, res) => {
        userHelpers.checkOldPassword(req.body, req.session.user).then((response) => {
            if (response.status) {
                res.render('user/reset-password')
            }
            else {
                res.redirect('/reset-password')
            }
        })
    },
    resetPost: (req, res) => {
        userData = req.session.user
        userHelpers.updatePassword(req.body, userData).then((response) => {
            if (response.status) {
                res.redirect('/profile')
            }

        })
    },
    vieworderedproductGet: async (req, res) => {

        await userHelpers.getOrderProducts(req.query.id).then((products) => {
            console.log(products, 'uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu');
            res.render('user/view-ordered-product', { products })

        })


    },
    cancellorderedproductGet: (req, res) => {
        userHelpers.cancellOrder(req.query.id).then((response) => {
            if(response.change){
                console.log('enteredddddddddddddddddddd');
                userHelpers.refund(req.query.id).then((response)=>{
                    res.redirect('/orders')

                })
            }
           
        })

    },
    returnorderedproductGet: (req, res) => {
        userHelpers.returnOrder(req.query.id).then((response) => {
            if(response.change){
                console.log('enteredddddddddddddddddddd');
                userHelpers.refund(req.query.id).then((response)=>{
                    res.redirect('/orders')

                })
            }
        })

    },
    
    offerGet: (req, res) => {
        userHelpers.viewCoupens().then((coupen) => {
            console.log(coupen, 'jjjjjjjjjjjjjjjjjjjjjjjjj');
            res.render('user/viewCoupons', { coupen })
        })

    },
    coupenPost: async (req, res) => {

        let user = req.session.user._id



        const date = new Date()

        let totalAmount = await userHelpers.getTotalAmount(user)
        let Total = totalAmount



        if (req.body.coupon == '') {
            res.json({ noCoupon: true, Total })
        } else {
            let couponResponse = await userHelpers.applyCoupon(req.body, user, date, totalAmount)
            if (couponResponse.verify) {
                // console.log('ttttttttttttttttttttttttttttttttttt');
                couponResponse.originalPrice=totalAmount
                let discountAmount = (totalAmount * parseInt(couponResponse.couponData.value)) / 100
                if (discountAmount > parseInt(couponResponse.couponData.maxAmount))
                    discountAmount = parseInt(couponResponse.couponData.maxAmount)
                let amount = totalAmount - discountAmount
                couponResponse.discountAmount = Math.round(discountAmount)
                couponResponse.amount = Math.round(amount)
                console.log(couponResponse.amount,'kkkkkkkkkkkkqqqqqqqqqqqqqq');
                req.session.amount=Math.round(amount)
                couponResponse.savedAmount=totalAmount-Math.round(amount)
                res.json(couponResponse)
            } else {
                couponResponse.Total = totalAmount
                console.log(couponResponse,'qqqqqqqqqqqqqaaaaaaaaaaaaaaaaaa');


                res.json(couponResponse)
            }
        }
    },
    addToWish: (req, res) => {

        console.log("hi wishhhhhhhhhhhhhhhhhhhhhhhhh");
        let id = req.params.id
        console.log(id, 'sdk;fms;dkf');
        userHelpers.addTowish(req.params.id, req.session.user._id).then(() => {
          res.json({ status: true })
      
      
        })
      },
      mywishGet:async(req,res)=>{
        logIn = req.session.user
        // let wishCount = null
        // let cartCount = null
        if (logIn) {
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            wishCount = await userHelpers.getWishCount(req.session.user._id)
        }
        let products = await userHelpers.getWishProducts(req.session.user._id)
        let total = await userHelpers.getTotalWishAmount(req.session.user._id)
        res.render('user/wishlist',{products,total,cartCount,wishCount,logIn})
      },
      DeleteProductWish: (req, res, next) => {
        console.log('inside jss');
          userHelpers.delFromWish(req.body).then((response) => {
            res.json({ response })
          })
        },
      
      






}