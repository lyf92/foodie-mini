//index.js
const app = getApp()
const base_url = require('../../config').base_url
const items = require('../../data/indexItems.js')

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    videoList: [],
    currentVideoId: '',
    preVideoId: '',
    windowHeight: null,
    showItems: false,
    items: []
  },

  onLoad: function() {
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })

              wx.request({
                method: 'POST',
                url: base_url + 'api/users/0',
              })
            }
          })
        }
      }
    })

    this.setData({
      items: items
    })
  },

  onShow: function() {
    var that = this
    wx.getSystemInfo({
      success(res) {
        that.setData({
          windowHeight: res.windowHeight
        })
      }
    })

    this.getVideos()
  },

  getVideos: function() {
    wx.request({
      url: base_url + 'api/files',
      data: {
        'userId': '0'
      },
      success: res => {
        console.log("data=", res)
        this.setData({
          videoList: res.data
        }, function() {
          this._observer = wx.createIntersectionObserver()
          this._observer
            .relativeToViewport()
            .observe('#video0', res => {
              if (res && res.intersectionRatio > 0.5) {
                wx.createVideoContext(res.id).play()
              } else {
                wx.createVideoContext(res.id).stop()
              }
            })
        })
      }
    })
  },

  onScrollVideos: function(e) {
    var that = this

    const query = wx.createSelectorQuery()
    query.selectAll('.video').boundingClientRect()
    query.exec(function(res) {
      const watchedNodes = res[0]

      for (var node of watchedNodes) {
        if (node.top > 80) {
          that.setData({
            currentVideoId: node.dataset.id
          })
          break;
        }
      }

      if (that.data.preVideoId != that.data.currentVideoId) {
        that.setData({
          preVideoId: that.data.currentVideoId
        })

        // 停止所有视频
        for (var node of watchedNodes) {
          wx.createVideoContext(node.dataset.id).pause()
        }

        this._observer = wx.createIntersectionObserver()
        this._observer
          .relativeToViewport()
          .observe('#' + that.data.currentVideoId, res => {
            if (res && res.intersectionRatio > 0.5) {
              wx.createVideoContext(res.id).play()
            }
          })
      }
    })
  },

  // 选择视频
  onChooseVideo: function() {
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success: function(res) {
        wx.navigateTo({
          url: '../uploadVideo/uploadVideo?videoUrl=' + res.tempFilePath
        })
      },
      fail: function(e) {
        wx.showToast({
          title: '选择视频失败了呦～重新选择吧～',
        })
      }
    })
  },

  onGetUserInfo: function(e) {
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  showItem: function(e) {
    this.setData({
      showItems: !this.data.showItems
    })
  },

  filterVideo: function(e) {
    var index = e.currentTarget.dataset.id
    for (var i = 0; i < this.data.items.length; i++) {
      if (i == index) {
        this.data.items[i].choosed = true
        continue
      }
      this.data.items[i].choosed = false
    }
    this.setData({
      items: this.data.items,
      showItems: false
    })
    
    wx.request({
      url: base_url + 'api/users/0/files',
    })
  },

  onFavIcon: function(e) {
    var that = this
    const index = e.currentTarget.dataset.id
    const video = that.data.videoList[index]
    wx.request({
      method: 'POST',
      url: base_url + 'api/users/0/files/' + video.id,
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        isFav: !video.liked
      },
      success: function(e) {
        that.data.videoList[index].liked = !video.liked
        that.setData({
          videoList: that.data.videoList
        })
      }
    })
  },

  // 上传图片
  uploadImage: function() {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]

        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath

            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  }

})