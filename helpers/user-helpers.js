var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const { ObjectID } = require('bson')
const { response } = require('express')
require('dotenv').config();
const Client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
var objectId = require('mongodb').ObjectId
const Razorpay = require('razorpay')
const { resolve } = require('path')

var instance = new Razorpay({ 
    key_id: 'rzp_test_gFSzKrbiJVMqDa',
    key_secret: 'xyM3duBSdGj0LM5YfK4aCj5D' })
var paypal = require('paypal-rest-sdk');
paypal.configure({
    'mode': 'sandbox', //sandbox or live 
    'client_id': 'AXWaSUDse_23OjiACaKxoX6FatSRmciMRzauilfQrFJfjb9vCBXe6EoenMi5tOeMnf19cDR9BQqC5QSJ', // please provide your client id here 
    'client_secret': 'EOMDDPfwS-uryZD3FWObPXFP-gcIVZB9kzbuxm-UfQn7lCsaLR67vEQi7KKRe-KzmgHJbZYQYUQQcChQ' // provide your client secret here 
  });

module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            if (user) {
                resolve({ status: false })

            } else {
                userData.password = await bcrypt.hash(userData.password, 10)
                userData.blocked = false
                userData.wallet = 0
                db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((response) => {
                    resolve({ status: true })
                })
            }


        })

    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        console.log('login success')
                        response.user = user
                        response.status = true
                        resolve(response)
                    } else {
                        console.log('failed')
                        resolve({ status: false })
                    }
                })
            } else {
                console.log('login failed')
                resolve({ status: false })
            }
        })
    },

    getallUsers: () => {
        return new Promise(async (resolve, reject) => {
            let users = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(users)
        })
    },
    //OTP WORKS
    doOTP: (userData) => {
        let response = {}
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ phoneNumber: userData.phone })
            if (user) {

                response.status = true
                response.user = user
            console.log(userData.phone,'ttttttttttttttyyyyyyyyyyyyyy');
                Client.verify.services(process.env.TWILIO_SERVICE_ID)
                    .verifications
                    .create({ to: `+91${userData.phone}`, channel: 'sms' })
                    .then((data) => {


                    });
                resolve(response)
            }
            else {
                response.status = false;
                resolve(response)
            }
        })

    },

    doOTPConfirm: (confirmotp, userData) => {
        return new Promise((resolve, reject) => {

            console.log(userData)
            Client.verify.services(process.env.TWILIO_SERVICE_ID)
                .verificationChecks
                .create({
                    to: `+91${userData.phoneNumber}`,
                    code: confirmotp.phone
                })
                .then((data) => {
                    if (data.status == 'approved') {

                        resolve({ status: true })
                    } else {
                        resolve({ status: false })
                    }
                })
        })
    },
    addtoCart: (proId, userId) => {
        let ProObj = {
            item: objectId(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == proId)
                console.log(proExist);
                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: objectId(userId), 'products.item': objectId(proId) },
                            {
                                $inc: { 'products.$.quantity': 1 }
                            }
                        ).then(() => {
                            resolve()
                        })

                }
                else {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId) }, { $push: { products: ProObj } }).then((response) => {
                        resolve()
                    })

                }
            }
            else {
                let cartObj = {
                    user: objectId(userId),
                    products: [ProObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }
        })

    },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            //console.log(userId,'tttttttttttttttttttttttttttttttttttttttttttttttttyyyyyyyyyyyyyyyyyyyy');
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }

                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }

                    }

                }

            ]).toArray()
            console.log(cartItems, 'qqqqqqqqqqqqqqqqqqqqqqqqqqqwwwwwwwwwwwwwwwwwwqqqqqqqqqqqqqqqqqqqqwwwwwwwwwwwwwwwwwwwwwqqqqqq');
            resolve(cartItems)
        })

    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (cart) {
                count = cart.products.length
            }
            resolve(count)

        })

    },
    changeProductQuantity: (details) => {
        //console.log(details,'uuuuuuuuuuuuuhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh');
        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)
        return new Promise((resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: objectId(details.cart) },
                        {
                            $pull: { products: { item: objectId(details.product) } }
                        }
                    ).then((response) => {
                        resolve({ removeProduct: true })
                    })

            }
            else {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                        {
                            $inc: { 'products.$.quantity': details.count }
                        }
                    ).then((response) => {
                        resolve({ status: true })
                    })

            }

        })


    },
    removeItem: (details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION)
                .updateOne({ _id: objectId(details.cart) },
                    {
                        $pull: { products: { item: objectId(details.product) } }
                    }
                ).then((response) => {
                    resolve({ removeProduct: true })
                })

        })

    },
    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            //console.log(userId,'tttttttttttttttttttttttttttttttttttttttttttttttttyyyyyyyyyyyyyyyyyyyy');
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }

                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }

                    }

                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', { $toInt: '$product.newprice' }] } }

                    }
                }

            ]).toArray()
            //console.log(total[0].total,'qqqqqqqqqqqqqqqqqqqqqqqqqqqwwwwwwwwwwwwwwwwwwqqqqqqqqqqqqqqqqqqqqwwwwwwwwwwwwwwwwwwwwwqqqqqq');
            resolve(total[0]?.total)
        })


    },
    placeOrder: (order, products, total) => {
        return new Promise((resolve, reject) => {
            console.log(order, products, total);
            let status = order.paymentMethod === 'COD' ? 'placed' : 'pending'
            let orderObj = {
                deliveryDetails: {
                    place: order.place,
                    city: order.city,
                    housename: order.housename,
                    postoffice: order.postoffice,
                    pincode: order.pincode
                },
                userId: objectId(order.userId),
                paymentMethod: order.paymentMethod,
                products: products,
                totalAmount: total,
                status: status,
                date: new Date()
            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectId(order.userId) })

                resolve(response.insertedId)
            })

        })


    },
    getCartProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION)
                .findOne({ user: objectId(userId) })
            resolve(cart.products)

        })
    },
    conformUser: (details) => {
        let response = {}
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ phoneNumber: details.phone, email: details.email })
            if (user) {
                response.status = true
                response.user = user

                resolve(response)
            }
            else {
                response.status = false
                resolve(response)
            }

        })


    },
    resetPassword: async (details, userData) => {
        PassWorD = await bcrypt.hash(details.password, 10)
        await db.get().collection(collection.USER_COLLECTION).updateOne({ email: userData.email, phoneNumber: userData.phoneNumber }, { $set: { password: PassWorD } }).then((data) => {
            //resolve(response)

        })


    },
    generateRazorpay: (orderId, total) => {
        console.log(orderId,"ooooooooooooooooooooooooooooooooo");
        return new Promise(async (resolve, reject) => {
            var order = await instance.orders.create({
                amount: total * 100,
                currency: "INR",
                receipt: "" + orderId,
                notes: {
                    key1: "value3",
                    key2: "value2"
                }
            })
            resolve(order)
        })



    },
    verifyPayment: (details) => {
        //console.log(details,"Lllllllllllllllllllllllll",details['payment[razorpay_order_id]'],);
        return new Promise((resolve, reject) => {
            const crypto = require('crypto')
            let hmac = crypto.createHmac('sha256', 'xyM3duBSdGj0LM5YfK4aCj5D')
            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
            hmac = hmac.digest('hex')
            //console.log(hmac,"uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu",details['payment[razorpay_signature]']);
            if (hmac == details['payment[razorpay_signature]']) {
                console.log("iam hereeeeeeeeeeeeeeeee");
                resolve()
            } else {
                console.log("iam nottttttttttttttttttttttttttttttttttttt hereeeeeeeeeeeeeeeee");
                reject()
            }
        })

    },
    changePaymentStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION)
                .updateOne({ _id: objectId(orderId) }, {
                    $set: {
                        status: 'placed'
                    }
                }).then(() => {
                    resolve()
                })
        })
    },
    addAddress: (Address, userId) => {
        return new Promise((resolve, reject) => {
            Address.addressId = new Date().valueOf()
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) }, { $push: { address: Address } })
            resolve()
        })

    },
    AllAddress: (userId) => {
        return new Promise(async (resolve, reject) => {
            let address = await db.get().collection(collection.USER_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(userId) }
                },
                {
                    $unwind: '$address'
                }, {
                    $project: {
                        _id: 0,
                        address: '$address'
                    }
                }


            ]).toArray() // toArray- convert into an array
            resolve(address)
        })
    },
    deleteAddress: (addressId, userId) => {
        console.log(addressId, userId, 'in deleteeeeeeeeeeeeeeeeeeeeeeeeeeeeee');
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION)       //parseInt is for form data in the from of string
                .updateOne({ _id: objectId(userId) }, { $pull: { address: { addressId: parseInt(addressId) } } })
            resolve()
        })
    },
    checkOldPassword: (oldPassword, userDetails) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userDetails._id) })

            bcrypt.compare(oldPassword.password, user.password).then((status) => {
                if (status) {
                    // console.log('login successsssssssssssssssssssssssssssss')
                    // response.user = user
                    response.status = true
                    resolve(response)
                } else {
                    console.log('failedssssssssssssssssssssssssssssssssssssssssss')
                    resolve({ status: false })

                }

            })
        })
    },
    updatePassword: (details) => {
        return new Promise(async (resolve, reject) => {

            //let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })

            userData.password = await bcrypt.hash(details.password, 10)
            db.get().collection(collection.USER_COLLECTION).updateOne({ email: userData.email }, { $set: { password: userData.password } }).then((response) => {
                response.status = true
                resolve(response)
            })



        })

    },
    getOrderProducts: (orderId) => {
        console.log(orderId, 'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk');
        return new Promise(async (resolve, reject) => {
            //console.log(userId,'tttttttttttttttttttttttttttttttttttttttttttttttttyyyyyyyyyyyyyyyyyyyy');
            let cartItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(orderId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }

                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }

                    }

                }

            ]).toArray()
            console.log(cartItems, 'qqqqqqqqqqqqqqqqqqqqqqqqqqqwwwwwwwwwwwwwwwwwwqqqqqqqqqqqqqqqqqqqqwwwwwwwwwwwwwwwwwwwwwqqqqqq');
            resolve(cartItems)
        })

    },
    cancellOrder: (orderId) => {
        console.log(orderId, 'fffffffffffffffffffffffffffrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr');
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) }, {
                $set: {
                    status: 'canceled'
                }
            }
            )
            response.change=true
            resolve(response)
        })
    },
    refund:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
            let orderDetails=await db.get().collection(collection.ORDER_COLLECTION).findOne({_id:objectId(orderId)})
            userId=orderDetails.userId
            if(orderDetails.paymentMethod==="ONLINE" || orderDetails.paymentMethod==="PAYPAL" ){
                await db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{$inc:{wallet:orderDetails.totalAmount}})
            resolve()

            }

            
        })
    },
    returnOrder: (orderId) => {
        console.log(orderId, 'fffffffffffffffffffffffffffrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr');
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) }, {
                $set: {
                    status: 'return'
                }
            })
            response.change=true
            resolve(response)
        })
    },
    createPay: (payment) => {
        //console.log(payment,'ppppaaaymmmeeemtttttt');
        return new Promise((resolve, reject) => {
            console.log(payment.amount,'ppppaaaymmmeeemtttttttttttttttttttttttt');
            paypal.payment.create(payment, function (err, payment) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(payment);
                }
            });
        })
    },

    viewCoupens: () => {
        return new Promise(async (resolve, reject) => {
            let coupen = await db.get().collection(collection.COUPEN_COLLECTION).find().toArray()
            resolve(coupen)

        })

    },
    applyCoupon: (details, userId, date, totalAmount) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let coupon = await db.get().collection(collection.COUPEN_COLLECTION).findOne({ code: details.coupon, status: true })
            console.log(coupon, 'couponpre');

            if (coupon) {
                const expDate = new Date(coupon.endingdate)
                response.couponData = coupon
                let user = await db.get().collection(collection.COUPEN_COLLECTION).findOne({ code: details.coupon, Users: objectId(userId) })
                if (user) {
                    response.used = "Coupon Already Used"
                    resolve(response)
                } else {

                    if (date <= expDate) {

                        response.dateValid = true

                        resolve(response)
                        let total = totalAmount
                        console.log(total, 'total');
                        console.log(coupon.minAmount, 'kkkkmin');
                        console.log(coupon.maxAmount, 'kkkkkmax');

                        if (total >= coupon.minAmount) {
                            console.log('amount heloooo');
                            response.verifyminAmount = true

                            resolve(response)

                            if (total <= coupon.maxAmount) {
                                console.log('amountmax heloooo');
                                response.verifymaxAmount = true

                                resolve(response)
                            } else {
                                response.verifyminAmount = true
                                response.verifymaxAmount = true
                                resolve(response)
                            }

                        } else {
                            response.minAmountMsg = 'Your minimum purchase should be:' + coupon.minAmount
                            response.minAmount = true
                            resolve(response)
                        }




                    } else {
                        response.invalidDateMsg = 'Coupon Expired'
                        response.invalidDate = true
                        response.Coupenused = false

                        resolve(response)
                        console.log('invalid date');
                    }


                }
            } else {
                response.invalidCoupon = true
                response.invalidCouponMsg = ' Invalid Coupon '
                resolve(response)
            }

            if (response.dateValid && response.verifymaxAmount && response.verifyminAmount) {
                response.verify = true

                db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId) }, {

                    $set: {
                        coupon: objectId(coupon._id)
                    }
                })

                resolve(response)
            }
        })
    },
    addTowish: (proId, userId) => {
        console.log('inside userhelper');
        let proObj = {
            item: objectId(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userWish = await db.get().collection(collection.WISH_COLLECTION).findOne({ user: objectId(userId) })
            if (userWish) {
                let proExist = userWish.products.findIndex(product => product.item == proId)
                console.log(proExist);
                if (proExist != -1) {
                    db.get().collection(collection.WISH_COLLECTION)
                        .updateOne({ user: objectId(userId), 'products.item': objectId(proId) },
                            {
                                $inc: { 'products.$.quantity': 1 }
                            }
                        ).then(() => {
                            resolve()
                        })

                }
                else {



                    db.get().collection(collection.WISH_COLLECTION).
                        updateOne({ user: objectId(userId) },
                            {

                                $push: { products: proObj }

                            }
                        ).then((response) => {
                            resolve()
                        })
                }
            }
            else {
                let WishObj = {
                    user: objectId(userId),
                    products: [proObj]
                }
                db.get().collection(collection.WISH_COLLECTION).insertOne(WishObj).then((response) => {
                    resolve()
                })
            }
        })
    },
    getWishCount: (userId) => {
        console.log(userId);
        return new Promise(async (resolve, reject) => {
            let count = 0
            let wish = await db.get().collection(collection.WISH_COLLECTION).findOne({ user: objectId(userId) })
            if (wish) {
                count = wish.products.length

            }
            resolve(count)
            console.log(count);
        })
    },
    getWishProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let wishItems = await db.get().collection(collection.WISH_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                }, {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }

                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }

            ]).toArray()

            resolve(wishItems)

        })
    },
    getTotalWishAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            
            let total = await db.get().collection(collection.WISH_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                }, {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
    
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }, {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', '$product.Price'] } }
                    }
                }
            ]).toArray()
            
    
            resolve(total[0]?.total)
    
        })
    },
    delFromWish:(details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.WISH_COLLECTION)
                .updateOne({ _id: objectId(details.cart) },
                    {
                        $pull: { products: { item: objectId(details.product) } }
                    }
                ).then((response) => {
                    resolve({ removeProduct: true })
                })

        })

    },
    getSingleOrder:(orderId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).findOne({_id:objectId(orderId)}).then((response)=>{
                resolve(response)

            })
            
        })
    },
    findUser:(userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId)}).then((response)=>{
                resolve(response)
            })
        })
    },
    paginatorCount:(count)=>{
        return new Promise((resolve, reject) => {
          pages = Math.ceil(count/10 )
          let arr = []
          for (let i = 1; i <= pages; i++) {
              arr.push(i)
          }
          resolve(arr)
         })
      },
      getTenProducts: (Pageno) => {
        return new Promise(async (resolve, reject) => {
            let val = (Pageno - 1) * 10
            let AllProducts_ = await db.get().collection(collection.ORDER_COLLECTION)
                .find().sort({ _id: -1 }).skip(val).limit(10).toArray()
    
            resolve(AllProducts_)
        })
    },
paginatorCountFive:(count)=>{
    return new Promise((resolve, reject) => {
      pages = Math.ceil(count/5 )
      let arr = []
      for (let i = 1; i <= pages; i++) {
          arr.push(i)
      }
      resolve(arr)
     })
  },
getFiveProducts: (Pageno) => {
    return new Promise(async (resolve, reject) => {
        let val = (Pageno - 1) * 5
        let AllProducts_ = await db.get().collection(collection.PRODUCT_COLLECTION)
            .find().skip(val).limit(5).toArray()

        resolve(AllProducts_)
        })
    }

    




}