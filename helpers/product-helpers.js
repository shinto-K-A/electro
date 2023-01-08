var db=require('../config/connection')
var collection=require('../config/collections')
const { response } = require('express')
const { ObjectId } = require('mongodb')
var objectId = require('mongodb').ObjectId
module.exports={
    addProduct:(details)=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).insertOne(details)
            resolve()

        })
        
            //callback(data.insertedId)

            //callback(data.ops[0]._id)

        
    },
    getAllproducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    getLaptops:()=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.PRODUCT_COLLECTION).find({category:'laptop'}).toArray().then((response)=>{
                resolve(response)

            })
            
        })

    },
    getAcesory:()=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.PRODUCT_COLLECTION).find({category:'accessory'}).toArray().then((response)=>{
                resolve(response)

            })
            
        })

    },
    getCamera:()=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.PRODUCT_COLLECTION).find({category:'camera'}).toArray().then((response)=>{
                resolve(response)

            })
            
        })

    },
    //edit product GET//
    getOneproduct:(userID)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(userID)}).then((products)=>{
                resolve(products)

            })
            
        })
    },
    deleteProduct:(userID)=>{
        return new Promise ((resolve,reject)=>{
            console.log(userID)
            console.log(objectId(userID))
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objectId(userID)}).then((response)=>{
                resolve(response)
            })
        })
    },
    updateProduct: (productId, productDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(productId) }, {
                $set: {
                    product: productDetails.product,
                    about: productDetails.about,
                    newprice: productDetails.newprice,
                    oldrice: productDetails.oldprice,
                    percentage: productDetails.percentage,
                    image: productDetails.image,
                    image1: productDetails.image1,
                    image2: productDetails.image2,
                    image3: productDetails.image3
                }
            }).then((response) => {
                resolve()
            })
        })
    },
    getAllCategories: () => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray().then((response)=>{
                resolve(response)

            })
            
        })
    },
    addCategory:(categoryName)=>{
        return new Promise((resolve,reject)=>{
          db.get().collection(collection.CATEGORY_COLLECTION).insertOne(categoryName).then((data)=>{
            resolve(data.insertedId)
          })
        })
      },
      deleteCategory:(categoryId)=>{
        return new Promise((resolve,reject)=>{
          db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({_id:objectId(categoryId)}).then((response)=>{
            resolve(response)
          })
        })
      },
      findoneCategory:(categoryId)=>{
        return new Promise((resolve,reject)=>{
          db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:objectId(categoryId)}).then((response)=>{
            resolve(response)
          })
        })
      },
    editCategory: (categoryId, categoryDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).updateOne({ _id: objectId(categoryId) }, {
                $set: {
                    category: categoryDetails.category
                }
            }).then((response) => {
                resolve()
            })
        })
    },
    updateStock: (productId, productDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(productId) }, {
                $set: {
                    stock: productDetails.stock
                }
            }).then((response) => {
                resolve()
            })
        })
    },
    getAllBanner: () => {  
        return new Promise(async (resolve, reject) => {   
            let products =await db.get().collection(collection.BANNER_COLLECTION).find({status:true}).toArray()
            resolve(products)
        })

    },
    getAllBannerAdmin: () => {  
        return new Promise(async (resolve, reject) => {   
            let products =await db.get().collection(collection.BANNER_COLLECTION).find().toArray()
            resolve(products)
        })

    },
    getOneBanner:(banerId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.BANNER_COLLECTION).findOne({ _id: objectId(banerId) }).then((response)=>{
                resolve(response)
            })


        })


     },
    // updateBaner:(banerId,details)=>{
    //     return new Promise((resolve, reject) => {
    //         db.get().collection(collection.BANNER_COLLECTION).updateOne({ _id: objectId(banerId) }, {
    //             $set: {
    //                 percentage: details.percentage,
                    
    //             }
    //         }).then((response) => {
    //             resolve()
    //         })
    //     })
    // },
    getAllOrders:()=>{
        return new Promise(async (resolve,reject)=>{
           let response=await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
                resolve(response)

        
                
            })
        },
        getmyOrders:(userid)=>{
            return new Promise(async (resolve,reject)=>{
                let response=await db.get().collection(collection.ORDER_COLLECTION).find({userId:objectId(userid)}).toArray()
                     resolve(response)
            })
            
        },
        fetchImage1: (proID) => {
            console.log(proID,'hi img 1');
            return new Promise(async (resolve, reject) => {
                let detail = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(proID) }, { projection: { image: true } })
                resolve(detail.image)
            })
        },
        fetchImage2: (proID) => {
            return new Promise(async (resolve, reject) => {
                let detail = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(proID) }, { projection: { image1: true } })
                resolve(detail.image1)
            })
        },
        fetchImage3: (proID) => {
            return new Promise(async (resolve, reject) => {
                let detail = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(proID) }, { projection: { image2: true } })
                resolve(detail.image2)
            })
        },
        fetchImage4: (proID) => {
            return new Promise(async (resolve, reject) => {
                let detail = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(proID) }, { projection: { image3: true } })
                resolve(detail.image3)
            })
            
            
            
            
        },
        fetchImageOne: (proID) => {
            console.log(proID,'hi img 1');
            return new Promise(async (resolve, reject) => {
                let detail = await db.get().collection(collection.BANNER_COLLECTION).findOne({ _id: objectId(proID) }, { projection: { banner: true } })
                resolve(detail.banner)
            })
        },
        addBanner:(details)=>{
            return new Promise(async(resolve,reject)=>{
                details.status=false
                await db.get().collection(collection.BANNER_COLLECTION).insertOne(details)
                resolve()
    
            })
        },
        updateBanner: (productId, productDetails) => {
            return new Promise((resolve, reject) => {
                db.get().collection(collection.BANNER_COLLECTION).updateOne({ _id: objectId(productId) }, {
                    $set: {
                        percentage: productDetails.percentage,
                        
                        banner: productDetails.banner,
                        
                    }
                }).then((response) => {
                    resolve()
                })
            })
        },
        deleteBanner:(banerId)=>{
            return new Promise((resolve,reject)=>{
                db.get().collection(collection.BANNER_COLLECTION).deleteOne({_id:objectId(banerId)}).then((response)=>{
                    resolve()
                })
            })
        },
        blockBanner:(bannerId)=>{
            return new Promise((resolve,reject)=>{
                db.get().collection(collection.BANNER_COLLECTION).updateOne({_id:objectId(bannerId)},{$set:{status:false}}).then((response)=>{
                    resolve()
                })
            })
        },
        blockFirst:()=>{
            return new Promise((resolve,reject)=>{
                db.get().collection(collection.BANNER_COLLECTION).updateOne({status:true},{$set:{status:false}}).then((response)=>{
                    resolve()
                })
            })

        },
        unblockBanner:(bannerId)=>{
            return new Promise((resolve,reject)=>{
                db.get().collection(collection.BANNER_COLLECTION).updateOne({_id:objectId(bannerId)},{$set:{status:true}}).then((response)=>{
                    resolve()
                })
            })
        },







    }

    
       
   

