var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
var objectId = require('mongodb').ObjectId
module.exports = {
    getallUsers: () => {
        return new Promise(async (resolve, reject) => {
            let users = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(users)
        })
    },
    blockUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) }, {
                $set: {
                    blocked: true
                }
            })
            resolve()
        })
    },
    unblockUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) }, {
                $set: {
                    blocked: false
                }
            })
            resolve()
        })
    },
    cancellOrder: (orderId) => {
        console.log(orderId, 'fffffffffffffffffffffffffffrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr');
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) }, {
                $set: {
                    status: 'canceled'
                }
            })
            let response={}
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
    shipedOrder: (orderId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) }, {
                $set: {
                    status: 'shipped'
                }
            })
            resolve()
        })
    },
    deliveredOrder: (orderId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) }, {
                $set: {
                    status: 'delivered'
                }
            })
            resolve()
        })
    },
    getYearlySalesGraph: () => {
        return new Promise(async (resolve, reject) => {
            let sales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $project: { date: 1, totalAmount: 1 }
                },

                {
                    $group: {
                        _id: { $dateToString: { format: "%Y", date: "$date" } },
                        totalAmount: { $sum: '$totalAmount' },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: {
                        _id: 1
                    }
                },
                {
                    $limit: 7
                }
            ]).toArray()
            resolve(sales)
        })
    },
    getTotalOrders: () => {
        return new Promise(async (resolve, reject) => {
            let orderCount = await db.get().collection(collection.ORDER_COLLECTION).find().count()
            resolve(orderCount)
        })
    },
    getAllProductCount: () => {
        return new Promise(async (resolve, reject) => {
            let productCount = await db.get().collection(collection.PRODUCT_COLLECTION).find().count()
            resolve(productCount)
        })

    },
    getAllSales: () => {
        return new Promise(async (resolve, reject) => {
            let salesData = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $project: { date: 1, totalAmount: 1 }
                },
                {
                    $group: {
                        _id: { day: { $dayOfYear: { $toDate: "$date" } } },
                        totalAmount: { $sum: '$totalAmount' },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { _id: -1 }
                },
                {
                    $limit: 5
                }
            ]).toArray()
            console.log(salesData, 'qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');
            console.log()
            resolve(salesData[0].totalAmount)
        })
    },
    getDailySalesGraph: () => {
        return new Promise(async (resolve, reject) => {
            let sales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $project: { date: 1, totalAmount: 1 }
                },

                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                        totalAmount: { $sum: '$totalAmount' },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: {
                        _id: 1
                    }
                },
                {
                    $limit: 8
                }
            ]).toArray()
            resolve(sales)
        })
    },
    getTotalUsers: () => {
        return new Promise(async (resolve, reject) => {
            let totalUsers = await db.get().collection(collection.USER_COLLECTION).aggregate([
                {
                    $match: {
                        "blocked": false
                    }
                },
                {
                    $project: {
                        user: { _id: 1 }
                    }
                },
                {
                    $count: 'user'
                }
            ]).toArray()
            resolve(totalUsers[0]?.user)
        })
    },
    getYearlySalesGraph: () => {
        return new Promise(async (resolve, reject) => {
            let sales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $project: { date: 1, totalAmount: 1 }
                },

                {
                    $group: {
                        _id: { $dateToString: { format: "%Y", date: "$date" } },
                        totalAmount: { $sum: '$totalAmount' },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: {
                        _id: 1
                    }
                },
                {
                    $limit: 7
                }
            ]).toArray()
            resolve(sales)
        })
    },
    getDailySalesGraph: () => {
        return new Promise(async (resolve, reject) => {
            let sales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $project: { date: 1, totalAmount: 1 }
                },

                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                        totalAmount: { $sum: '$totalAmount' },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: {
                        _id: 1
                    }
                },
                {
                    $limit: 8
                }
            ]).toArray()
            resolve(sales)
        })
    },
    getMonthlySalesGraph: () => {
        return new Promise(async (resolve, reject) => {
            let sales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $project: { date: 1, totalAmount: 1 }
                },

                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
                        totalAmount: { $sum: '$totalAmount' },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: {
                        _id: 1
                    }
                },
                {
                    $limit: 7
                }
            ]).toArray()
            resolve(sales)
        })
    },
    addCoupon: (couponDetails) => {
        console.log((couponDetails,'iiiiiiiiiiiooooooooo'));
        return new Promise(async (resolve, reject) => {
            let response = {}
            let couponExist = await db.get().collection(collection.COUPEN_COLLECTION).findOne({ code: couponDetails.code })

            if (couponExist) {
                response.status = true
                response.message = "Coupon With this Code Already Exist"
                resolve(response)
                
            } else {
                couponDetails.status=true
                console.log('kkkkkkkkkkkkkkkkkkkkkk');
                await db.get().collection(collection.COUPEN_COLLECTION).insertOne(couponDetails).then((response) => {
                    response.message = 'Coupon Added successfully'
                    response.status = false
                    resolve(response)
                   
                })
            }

        })
    },
    viewCoupens: () => {
        return new Promise(async (resolve, reject) => {
            let coupen = await db.get().collection(collection.COUPEN_COLLECTION).find().toArray()
            resolve(coupen)

        })

    },
   








}