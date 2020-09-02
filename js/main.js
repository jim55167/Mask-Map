var app = new Vue({
  el: "#app",
  data: {
    map: null,
    dataList: {},
    url:
      "https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json",
    group: ["日", "一", "二", "三", "四", "五", "六"],
    peopleList: ["1,3,5,7,9", "0,2,4,6,8"],
    canbuy: "",
    county: [
      "臺北市",
      "新北市",
      "基隆市",
      "桃園市",
      "新竹市",
      "新竹縣",
      "苗栗縣",
      "臺中市",
      "彰化縣",
      "南投縣",
      "雲林縣",
      "嘉義縣",
      "嘉義市",
      "臺南市",
      "高雄市",
      "屏東縣",
      "宜蘭縣",
      "花蓮縣",
      "臺東縣",
      "澎湖縣",
      "金門縣",
      "連江縣",
    ],
    select: "",
    showList: [],
    greenMark: null,
    redMark: null,
    markLayer: null,
    loading: false,
    buy: "",
  },

  methods: {
    setMap() {
      this.map = L.map("map", {
        center: [25.0263453, 121.5263364],
        zoom: 16,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        //{x} 圖磚x座標 {y}圖磚的y座標 {z} 圖磚zoom層級
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.map);
    },
    getMaskData() {
      this.loading = true
      fetch(this.url)
        .then((response) => {
          return response.json();
        })        
        .then((jsonData) => {
        this.loading = false
          this.dataList = jsonData;
          this.setMark();
        });
    },
    setMark(err = []) {
      var data = err.length == 0 ? this.dataList["features"] : err;
      this.showList = data;

      this.dataList["features"].forEach((item) => {
        var [x, y] = item.geometry.coordinates;
        var {
          name,
          updated,
          note,
          mask_adult,
          mask_child,
          address,
          phone,
        } = item.properties;
        var marks =
          item.properties.mask_adult == 0 ? this.redMark : this.greenMark;
        this.markLayer.addLayer(
          L.marker([y, x], { icon: marks }).bindPopup(`<h2>${name}</h2>
                <h4>${address}</h4><a href="tel:{{store.properties.phone}}"><span>${phone}</span></a><h5>更新時間:${updated}</h5><p>備註:${note}</p>
                <div class='maskTotal'><h5>成人數量:${mask_adult}</h5><h5>兒童數量:${mask_child}</h5></div>
        `)
        );
      });
      this.map.addLayer(this.markLayer);
    },
    focusLocation(item) {
      setTimeout(() => {
        var [x, y] = item.geometry.coordinates;
        var {
          name,
          updated,
          note,
          mask_adult,
          mask_child,
          address,
          phone
        } = item.properties;
        this.map.setView([y, x], 18);
        L.popup()
          .setLatLng([y, x])
          .setContent(
            `<h2>${name}</h2>
                <h4>${address}</h4><a href="tel:{{store.properties.phone}}"><span>${phone}</span></a><h5>更新時間:${updated}</h5><p>備註:${note}</p>
                <div class='maskTotal'><h5>成人數量:${mask_adult}</h5><h5>兒童數量:${mask_child}</h5></div>
        `
          ).openOn(this.map);
      }, 1000);
    },
    colorMark() {
      //https://github.com/pointhi/leaflet-color-markers
      this.redMark = new L.Icon({
        iconUrl:
          "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      this.greenMark = new L.Icon({
        iconUrl:
          "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });
      //https://bit.ly/31iyeV3
      //L.MarkerClusterGroup()使用方法
      this.markLayer = new L.MarkerClusterGroup().addTo(this.map);
    },
    filterData(even) {
      var target = even.target.value;
      var err = this.dataList["features"].filter((item) => {
        return item.properties.county === target;
      });
      this.cleanMarker();
      this.setMark(err);
    },
    cleanMarker() {
      this.map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          this.map.removeLayer(layer);
        }
      });
    },
  },
  computed: {
    date: function () {
      var date = new Date();
      return date.toLocaleString();
    },
    day: function () {
      var date = new Date();
      var day = date.getDay();
      this.buy = day;
      return `星期${this.group[day]}`;
    },
    isBuy: function () {
      var date = new Date();
      var day = date.getDay();
      if (this.buy !== 0) {
        var num = day % 2 == 0 ? 1 : 0;
        return `${this.peopleList[num]}`;
      } else {
        return `0-9皆`;
      }
    },
  },

  mounted() {
    this.setMap();
    this.colorMark();
    this.getMaskData();
  },
});
