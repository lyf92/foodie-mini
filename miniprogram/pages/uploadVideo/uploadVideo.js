// pages/chooseLib/chooseLib.js

const app = getApp()
const base_url = require('../../config').base_url

Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoUrl: "",
    videoDescription: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      videoUrl: options.videoUrl
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },

  bindTextAreaBlur: function(e) {
    this.setData({
      videoDescription: e.detail.value
    })
  },

  // 上传视频
  onUploadVideo: function(e) {
    wx.uploadFile({
      url: base_url + 'api/files',
      filePath: this.data.videoUrl,
      name: 'video',
      formData: {
        "description": this.data.videoDescription
      },
      success: res => {
        wx.showToast({
          title: '上传成功！',
          icon: 'success',
          success: function() {
            setTimeout(function() {
              wx.navigateTo({
                url: '../index/index',
              })
            }, 1500)
          }
        })
      },
      fail: e => {
        wx.showToast({
          title: 'Ops...上传失败！',
          icon: 'none'
        })
      }
    })
  }

})