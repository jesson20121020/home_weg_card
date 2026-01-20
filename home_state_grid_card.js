import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

class CustomStateGridInfoQinglong extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object }
    };
  }

  _showToast(message) {
    const toast = document.createElement('div');
    toast.style = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${this.isDarkMode() ? '#333' : '#fff'};
      color: ${this.isDarkMode() ? '#ddd' : '#333'};
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 9999;
      font-size: 14px;
      animation: fadeInOut 2s ease-in-out;
    `;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 2000);
  }

  setConfig(config) {
    this.config = config;
    if (!config.tier1_price || !config.tier2_price || !config.tier3_price) {
      throw new Error("必须配置 tier1_price, tier2_price, tier3_price");
    }

    this._tier1_price = parseFloat(config.tier1_price);
    this._tier2_price = parseFloat(config.tier2_price);
    this._tier3_price = parseFloat(config.tier3_price);

    this._tier1_max = config.tier1_max !== undefined ? parseFloat(config.tier1_max) : 2520;
    this._tier2_max = config.tier2_max !== undefined ? parseFloat(config.tier2_max) : 4800;

    this._iscar = config.iscar === true;
  }

  static get styles() {
    return css`
      .container {
        background: var(--card-bg, #fff);
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.07);
        margin: 0;
        padding: 14px 16px 14px 16px;
        color: var(--card-fg, #222);
        font-family: "MiSans", "HarmonyOS Sans", "Helvetica Neue", Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", SimSun, sans-serif;
        width: 100%;
        max-width: none !important;
        box-sizing: border-box;
        min-width: 0;
        flex: 1;
        position: relative;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        @media (max-width: 480px) {
          padding: 12px;
          width: 100%;
        }
        @media (prefers-color-scheme: dark) {
          background: #222 !important;
          color: #eee !important;
        }
      }
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-weight: 600;
        font-size: 1.18em;
        margin-bottom: 0.6em;
      }
      .title {
        display: flex;
        align-items: center;
        gap: 5px;
      }
      .money {
        font-size: 2.1em;
        font-weight: bold;
        color: #09b69f;
        line-height: 1.1;
      }
      .money.warning { color: #F44336 }
      .row {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin: 8px 0 0 0;
      }
      .col {
        flex: 1;
        min-width: 70px;
        text-align: center;
      }
      .label {
        color: #888;
        font-size: .93em;
        margin-top: .4em;
      }
      .days {
        font-size: 1.4em;
        color: #e38800;
        font-weight: 500;
      }
      .btn-bar {
        display: flex;
        margin: 14px 0 6px 0;
        gap: 8px;
      }
      .btn {
        flex:1;
        background: #eee;
        text-align: center;
        border-radius: 7px;
        padding: 4px 0;
        font-size: 1em;
        cursor: pointer;
        transition: background .2s;
      }
      .btn.active {
        background: #10dbc7;
        color: #fff;
      }

      @media (prefers-color-scheme: dark) {
        .btn {
          background: #444;
          color: #ddd;
        }
        .btn.active {
          background: #10dbc7;
          color: #fff;
        }
      }

      .chart, .calendar {
        margin-top: 12px;
        border-radius: 10px;
        background: #fafbfc;
        padding: 0;
        overflow-x: hidden;
        min-width: 0;
        box-sizing: border-box;
        @media (max-width: 480px) {
          padding: 0;
        }
        @media (prefers-color-scheme: dark) {
          background: #333;
        }
      }
      .calendar-table {
        width: 100%;
        border-collapse: collapse;
        text-align: center;
        font-size: 1em;
      }
      .calendar-table th {
        color: #666;
        padding: 2px 0;
        font-weight: 500;
      }
      .calendar-table td {
        padding: 0;
        border-radius: 4px;
        width: 36px;
        height: 36px;
        white-space: nowrap;
        font-size: 0.9em;
        line-height: 1.2;
        vertical-align: middle;
        text-align: center;
        box-sizing: border-box;
        border: none;
      }
      
      .calendar-table td.real-day {
        border: 1px solid #09b69f;
        @media (prefers-color-scheme: dark) {
          border-color: #4cd964;
        }
      }
      
      .calendar-table td.today.real-day {
        border-color: #0dc1a2 !important;
      }
      
      .calendar-table td.max-usage.real-day {
        border-color: #ff6b6b !important;
      }
      
      .calendar-table td.min-usage.real-day {
        border-color: #4cd964 !important;
      }
            
      .calendar-table td.today {
        background: #e5f3fe;
        font-weight: bold;
      }
      .calendar-table td.max-usage {
        background: #ffd4d4;
      }
      .calendar-table td.min-usage {
        background: #d6f7c9;
      }
      .calendar-table td.hasdata {
        color: #09b69f;
      }
      .calendar-info {
        margin-top: 0.3em;
        color: #888;
        font-size: 0.98em;
        text-align: left;
      }

      /* 阶梯电价样式 */
      .tier-indicator {
        position: relative;
        margin: 12px 0 0 0;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .tier {
        position: relative;
        flex: 1;
        min-height: 40px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        max-width: 140px;
        top: 13px;
        transition: top 0.3s ease;
      }
      
      .tier-block {
        position: relative;
        height: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 8px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 600;
        text-align: center;
        line-height: 1.2;
        z-index: 1;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
        overflow: hidden;
        white-space: nowrap;
        @media (prefers-color-scheme: dark) {
          color: #fff;
        }
      }
      
      .tier-1 .tier-block {
        background-color: rgb(85, 197, 147);
        clip-path: polygon(0% 0%, calc(100% - 12px) 0%, 100% 50%, calc(100% - 12px) 100%, 0% 100%);
        margin-right: -10px;
      }
      
      .tier-2 .tier-block {
        background-color: rgb(248, 195, 55);
        clip-path: polygon(0% 0%, calc(100% - 12px) 0%, 100% 50%, calc(100% - 12px) 100%, 0% 100%, 12px 50%);
        margin: 0 -10px;
      }
      
      .tier-3 .tier-block {
        background-color: rgb(247, 147, 53);
        clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 12px 50%);
        margin-left: -10px;
      }
      
      .tier.current .tier-block {
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        filter: brightness(1.05);
      }
      
      .tier-content {
        margin-top: 2px;
        text-align: center;
        font-size: 11px;
        color: #666;
        line-height: 1.3;
        padding: 6px 4px;
        border-radius: 4px;
        position: relative;
        overflow: hidden;
        z-index: 0;
        transition: all 0.3s ease;
      }
      
      .tier-content.hidden {
        display: none;
      }
      
      .tier-1 .tier-content {
        background: linear-gradient(to bottom, rgba(213, 250, 237, 0.9) 0%, rgba(237, 252, 245, 0.3) 100%);
      }
      
      .tier-2 .tier-content {
        background: linear-gradient(to bottom right, rgba(248, 247, 217, 0.9) 0%, rgba(255, 252, 236, 0.3) 100%);
      }
      
      .tier-3 .tier-content {
        background: linear-gradient(to bottom right, rgba(253, 240, 224, 0.9) 0%, rgba(254, 245, 238, 0.3) 100%);
      }
      
      .tier-title {
        font-weight: 600;
        margin-bottom: 2px;
        color: #444;
        @media (prefers-color-scheme: dark) {
          color: #ccc;
        }
      }
      
      .tier-range {
        margin-bottom: 2px;
        color: #555;
        @media (prefers-color-scheme: dark) {
          color: #ccc;
        }
      }
      
      .tier-price {
        color: #2196f3;
        font-weight: 500;
        @media (prefers-color-scheme: dark) {
          color: #4cd964;
        }
      }
      
      .red-line-indicator {
        position: absolute;
        top: 13px;
        left: 0;
        width: 3px;
        height: 15px;
        background-color: #ff0000;
        z-index: 8;
        box-shadow: 0 0 3px rgba(255, 0, 0, 0.7);
        transform: translateX(-50%);
      }
      
      .current-indicator {
        position: absolute;
        top: -18px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #ff5722;
        color: white;
        padding: 4px 10px;
        border-radius: 10px;
        font-size: 11px;
        font-weight: 600;
        white-space: nowrap;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        z-index: 10;
        display: flex;
        align-items: center;
        gap: 4px;
        pointer-events: none;
      }
      
      .current-indicator.tier-1 {
        background-color: rgb(85, 197, 147);
      }
      
      .current-indicator.tier-2 {
        background-color: rgb(248, 195, 55);
      }
      
      .current-indicator.tier-3 {
        background-color: rgb(247, 147, 53);
      }
      
      @media (prefers-color-scheme: dark) {
        .label {
          color: #ccc;
        }
        .days {
          color: #ffcc66;
        }
        .calendar-table th {
          color: #ccc;
        }
        .calendar-table td.today {
          background: #444;
          color: #fff;
        }
        .calendar-table td.max-usage {
          background: #660000;
        }
        .calendar-table td.min-usage {
          background: #006600;
        }
        .calendar-table td.hasdata {
          color: #4cd964;
        }
        .calendar-info {
          color: #ccc;
        }
      }
    `;
  }

  constructor() {
    super();
    this._panel = "main";
    this._year = new Date().getFullYear();
    this._month = new Date().getMonth() + 1;
    this._chartDayRendered = false;
    this._chartMonthRendered = false;
    this._currentMonthPage = 0;
    this._lastRenderedMonthPage = null;
    this._lastRenderedMonthData = null;
    this._selectedTierPrice = null;
  }

  isDarkMode() {
    const rootStyle = getComputedStyle(document.documentElement);
    const bg = rootStyle.getPropertyValue('--card-background-color') || '';
    const fg = rootStyle.getPropertyValue('--primary-text-color') || '';

    if (bg && fg) {
      const bgHex = bg.replace('#', '');
      const r = parseInt(bgHex.substr(0,2), 16);
      const g = parseInt(bgHex.substr(2,2), 16);
      const b = parseInt(bgHex.substr(4,2), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance < 0.5;
    }

    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  getEntityData() {
    const s = this.config.entity;
    if (!s) return {};
    const ent = this.hass?.states[s];
    if (!ent) return {};
    return ent.attributes || {};
  }

  getDianfei() {
    const data = this.getEntityData();
    let val = parseFloat(data.sumMoney || 0) || 0;
    let date = data.date || "";
    let name = data.friendly_name || "国网电费";
    let consNo = data.consNo || "未知户号";
    return { value: val, date, name, consNo };
  }

  getDayList() {
    const data = this.getEntityData();
    const arr = data.dayList || [];
    const result = [];
    for(const x of arr) {
      if (!x.day || x.day === "-") continue;
      let day = x.day;
      if (day.length === 8) day = `${day.substr(0,4)}-${day.substr(4,2)}-${day.substr(6,2)}`;
      let num = parseFloat(x.dayElePq);
      if(isNaN(num)) num = null;
      result.push({ day, num });
    }
    return result.reverse();
  }

  getMonthList() {
    const data = this.getEntityData();
    const arr = data.monthList || [];
    return arr.map(x => ({
      month: x.month,
      num: parseFloat(x.monthEleNum || 0),
      cost: parseFloat(x.monthEleCost || 0)
    }));
  }

  getLastMonthList() {
    const data = this.getEntityData();
    const arr = data.lmonthList || [];
    return arr.map(x => ({
      month: x.month,
      num: parseFloat(x.monthEleNum || 0),
      cost: parseFloat(x.monthEleCost || 0)
    }));
  }

  getYearStat() {
    const monthList = this.getMonthList();
    if (!monthList || monthList.length === 0) {
      return { year: '未知', num: 0, cost: 0 };
    }

    const latestMonth = monthList[0]?.month || '未知';
    const year = latestMonth.split('-')[0];

    const yearData = monthList.filter(x => x.month.startsWith(year));
    const totalNum = yearData.reduce((sum, x) => sum + x.num, 0);
    const totalCost = yearData.reduce((sum, x) => sum + x.cost, 0);

    return {
      year: year,
      num: totalNum,
      cost: totalCost
    };
  }

  getCurrentSystemPrevMonthStat() {
    const now = new Date();
    let y = now.getFullYear();
    let m = now.getMonth();
    if (m === 0) {
      m = 12;
      y--;
    } else {
      m--;
    }
    const prev = `${y}${String(m).padStart(2,'0')}`;

    let stat = this.getMonthList().find(x => x.month === prev);
    if (!stat) {
      stat = this.getLastMonthList().find(x => x.month === prev);
    }

    if (!stat) {
      const allMonths = [...this.getMonthList(), ...this.getLastMonthList()].sort((a, b) => b.month.localeCompare(a.month));
      stat = allMonths[0] || {num:0, cost:0};
    }

    return stat || {num:0, cost:0};
  }

  render() {
    if (!this.config || !this.hass) return html`<div>数据加载中...</div>`;

    const color_num = '#08b3a5';
    const color_cost = '#770ef6';

    const dianfei = this.getDianfei();
    const dayList = this.getDayList();
    const monthList = this.getMonthList();
    const lastMonthList = this.getLastMonthList();
    const isWarning = dianfei.value < 10;

    let isDisplayingLastYearData = false;
    const currentYear = new Date().getFullYear();
    const monthYear = this.getYearStat().year;

    if (monthYear !== '未知' && parseInt(monthYear) < currentYear) {
      isDisplayingLastYearData = true;
      this._currentMonthPage = 1;
    } else {
      this._currentMonthPage = 0;
    }

    if (monthList.length > 0 && lastMonthList.length > 0) {
      const firstMonthYear = monthList[0]?.month?.substring(0,4) || '';
      const firstLastMonthYear = lastMonthList[0]?.month?.substring(0,4) || '';
      if (firstMonthYear === firstLastMonthYear) {
        this._currentMonthPage = 1;
      }
    }

    if (monthList.length === 0) {
      this._currentMonthPage = 0;
    }

    if (this.__lastPanel !== this._panel) {
      this._chartDayRendered = false;
      this._chartMonthRendered = false;
      this.__lastPanel = this._panel;
    }

    if (this._panel === 'month') {
      this._lastRenderedMonthPage = null;
    }

    const prevMonthStat = this.getCurrentSystemPrevMonthStat();

    return html`
      <div class="container">
        <div class="header">
          <div class="title">
            <ha-icon icon="mdi:flash" style="color:#0dc1a2"></ha-icon>
            ${dianfei.name || "国网电费"}
          </div>
          <div class="money ${isWarning?'warning':''}">
            ¥${dianfei.value.toFixed(2)}
          </div>
        </div>

        <div style="color:#0066cc; font-weight:bold; font-size:1em; margin-bottom:4px;">
          电费户号：<span>${dianfei.consNo}</span>
        </div>

        <div style="color:#888; font-size:.99em; margin-bottom:4px;">
          数据日期：${dianfei.date || "-"}
        </div>

        <div class="row">
          <div class="col">
            <div class="days" style="color:#e38800">
              ${prevMonthStat.num !== undefined ? prevMonthStat.num : 0}
            </div>
            <div class="label">上月用电量(度)</div>
          </div>
          <div class="col">
            <div class="days" style="color:${color_cost}">
              ${prevMonthStat.cost !== undefined ? prevMonthStat.cost : 0}
            </div>
            <div class="label">上月电费(元)</div>
          </div>
        </div>

        <div class="btn-bar">
          <div class="btn ${this._panel==='main'?'active':''}" @click=${()=>this._setPanel('main')}>年用电</div>
          <div class="btn ${this._panel==='month'?'active':''}" @click=${()=>this._setPanel('month')}>月用电</div>
          <div class="btn ${this._panel==='day'?'active':''}" @click=${()=>this._setPanel('day')}>日用电</div>
          <div class="btn ${this._panel==='calendar'?'active':''}" @click=${()=>this._setPanel('calendar')}>日历</div>
        </div>

        ${this._panel === 'main' ? html`
          ${this._iscar ? html`
            <div class="row" style="margin-top:1em">
              <div class="col">
                <div class="days">${this.getYearStat().num}</div>
                <div class="label">${this.getYearStat().year}年用电(度)</div>
              </div>
              <div class="col">
                <div class="days">${this.formatMoney(this.getYearStat().cost)}</div>
                <div class="label">${this.getYearStat().year}年电费(元)</div>
              </div>
            </div>
          ` : ''}
          
          ${!this._iscar ? this.renderTierInfo() : ''}
        ` : ''}
        
        ${this._panel === 'day' ? this.renderDayChart(dayList, color_num, color_cost) : ""}
        ${this._panel === 'month' ? this.renderMonthChart(monthList, lastMonthList, color_num, color_cost) : ""}
        ${this._panel === 'calendar' ? this.renderCalendar(dayList, color_num, color_cost) : ""}
      </div>
    `;
  }

  _setPanel(panel) {
    this._panel = panel;
    this.requestUpdate();
  }

  renderDayChart(dayList, color_num, color_cost) {
    if (!this._chartDayRendered) {
      setTimeout(() => this._renderApexDay(dayList, color_num, color_cost), 50);
      this._chartDayRendered = true;
    }
    return html`
      <div class="chart">
        <div id="df_day_chart" style="height:200px; margin:0; padding:0; overflow:hidden;"></div>
        ${!this._iscar ? html`
          <div class="calendar-info" style="margin:0; padding:8px 0 0 0; display:flex; align-items:center; gap:8px;">
            <span style="font-size:0.9em; color:#666;">计算日电费：</span>
            <select
              @input=${(e) => { 
                const val = e.target.value;
                if (val) {
                  const price = parseFloat(val);
                  if (!isNaN(price)) {
                    this._selectedTierPrice = price;
                  } else {
                    this._selectedTierPrice = null;
                  }
                } else {
                  this._selectedTierPrice = null;
                }
            
                setTimeout(() => {
                  const chartEl = this.shadowRoot.getElementById("df_day_chart");
                  if (chartEl && chartEl._apexChartInstance) {
                    chartEl._apexChartInstance.updateOptions({}, true, true);
                  }
                }, 50);
            
                this.requestUpdate(); 
              }}
              style="padding:4px; border-radius:4px; font-size:0.9em;"
            >
              <option value="">请选择单价</option>
              <option 
                value="${this._tier1_price}" 
                ?selected=${this._selectedTierPrice === this._tier1_price}
              >第一阶梯：${this._tier1_price.toFixed(4)}元/度</option>
              <option 
                value="${this._tier2_price}" 
                ?selected=${this._selectedTierPrice === this._tier2_price}
              >第二阶梯：${this._tier2_price.toFixed(4)}元/度</option>
              <option 
                value="${this._tier3_price}" 
                ?selected=${this._selectedTierPrice === this._tier3_price}
              >第三阶梯：${this._tier3_price.toFixed(4)}元/度</option>
            </select>
            <span style="font-size:0.9em; color:#666;">点击上方图表</span>
          </div>
        ` : ""}
      </div>
    `;
  }
    
  renderMonthChart(monthList, lastMonthList, color_num, color_cost) {
    if (!monthList || monthList.length === 0) {
      return html`
        <div class="chart" style="text-align:center; padding:20px; color:#888;">
          <p>暂无月用电数据</p>
        </div>
      `;
    }

    const showLastYearButton = lastMonthList && lastMonthList.length > 0 && (
      this.getYearStat().year !== (lastMonthList[0]?.month?.substring(0,4) || '')
    );

    if (!this._chartMonthRendered) {
      setTimeout(() => this._renderApexMonth(monthList, lastMonthList, color_num, color_cost), 50);
      this._chartMonthRendered = true;
    }

    return html`
      <div class="chart">
        <div id="df_month_chart" style="height:200px; margin:0; padding:0; overflow:hidden;"></div>
        <div class="calendar-info" style="margin:0; padding:8px 0 0 0; display:flex; justify-content:center; gap:8px;">
          ${showLastYearButton ? html`
            <ha-icon icon="mdi:chevron-left" style="cursor:pointer; color:#09b69f;" @click=${() => { this._currentMonthPage = 1; this.requestUpdate(); }}></ha-icon>
            <span style="font-weight:bold;">${this._currentMonthPage === 0 ? '今年' : '去年'}</span>
            <ha-icon icon="mdi:chevron-right" style="cursor:pointer; color:#09b69f;" @click=${() => { this._currentMonthPage = 0; this.requestUpdate(); }}></ha-icon>
          ` : html`
            <span style="font-weight:bold; color:#09b69f;">
              ${this._currentMonthPage === 0 ? '今年' : '去年'}
            </span>
          `}
        </div>
      </div>
    `;
  }

  renderCalendar(dayList, color_num, color_cost) {
    const y=this._year, m=this._month;
    const firstDay = new Date(y, m-1, 1).getDay();
    const daysInMonth = new Date(y, m, 0).getDate();
    const today = new Date();
    const curMonth = `${y}-${String(m).padStart(2,'0')}`;
    const monthDays = dayList.filter(x=>x.day.startsWith(curMonth));
    const min = Math.min(...monthDays.map(x=>x.num).filter(x=>x!=null));
    const max = Math.max(...monthDays.map(x=>x.num).filter(x=>x!=null));

    let rows = [];
    let w=0, row=[];
    rows.push(html`<tr>${[...Array(7)].map((_,i)=>html`<th>${"日一二三四五六"[i]}</th>`)}</tr>`);
    for(let i=0;i<firstDay;i++){row.push(html`<td></td>`);w++;}
      for(let d=1;d<=daysInMonth;d++,w++) {
        let classes = [];
        const dayStr = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        if(today.getFullYear() === y && today.getMonth() + 1 === m && today.getDate() === d) {
          classes.push("today");
        }
        const dObj = monthDays.find(x => x.day === dayStr);
        if(dObj && dObj.num === min) classes.push("min-usage");
        if(dObj && dObj.num === max) classes.push("max-usage");
        if(dObj) classes.push("hasdata");
      
        const isRealDay = dayStr ? true : false;
      
        row.push(html`
          <td 
            class="${[...classes, isRealDay ? 'real-day' : ''].join(' ')}"
            @click=${this._iscar ? () => {} : () => this._handleDayClick(dayStr, dObj)}
            style="cursor:${this._iscar ? 'default' : 'pointer'};"
          >
            ${d}<br>
            ${dObj && dObj.num != null ? `${dObj.num}°` : ""}
            ${dObj && dObj.cost != null ? `<br>${dObj.cost}元` : ""}
          </td>
        `);
      
        if(w === 6) { rows.push(html`<tr>${row}</tr>`); row = []; w = -1; }
      }
          if(row.length) for(let i=row.length;i<7;i++) row.push(html`<td></td>`);
    if(row.length) rows.push(html`<tr>${row}</tr>`);
    return html`
      <div class="calendar">
        <table class="calendar-table" style="width:100%; margin:0; padding:0;">
          <thead></thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <div class="calendar-info" style="margin:0; padding:8px 0 0 0;">
          <b>${y}年${m}月</b>
          &nbsp; 
          <ha-icon icon="mdi:chevron-left" style="cursor:pointer; color:#09b69f;" @click=${e=>{e.preventDefault();this._month--;if(this._month<1){this._month=12;this._year--;}this.requestUpdate();}}></ha-icon>
          &nbsp; | &nbsp;
          <ha-icon icon="mdi:chevron-right" style="cursor:pointer; color:#09b69f;" @click=${e=>{e.preventDefault();this._month++;if(this._month>12){this._month=1;this._year++;}this.requestUpdate();}}></ha-icon>

          ${!this._iscar ? html`
            <div style="margin-top:8px; display:flex; align-items:center; gap:8px;">
              <span style="font-size:0.9em; color:#666;">计算日电费：</span>
              <select 
                @input=${(e) => { 
                  const val = e.target.value;
                  if (val) {
                    const price = parseFloat(val);
                    if (!isNaN(price)) {
                      this._selectedTierPrice = price;
                    } else {
                      this._selectedTierPrice = null;
                    }
                  } else {
                    this._selectedTierPrice = null;
                  }
                  this.requestUpdate(); 
                }}
                style="padding:4px; border-radius:4px; font-size:0.9em;"
              >
                <option value="">请选择单价</option>
                <option 
                  value="${this._tier1_price}" 
                  ?selected=${this._selectedTierPrice === this._tier1_price}
                >第一阶梯：${this._tier1_price.toFixed(4)}元/度</option>
                <option 
                  value="${this._tier2_price}" 
                  ?selected=${this._selectedTierPrice === this._tier2_price}
                >第二阶梯：${this._tier2_price.toFixed(4)}元/度</option>
                <option 
                  value="${this._tier3_price}" 
                  ?selected=${this._selectedTierPrice === this._tier3_price}
                >第三阶梯：${this._tier3_price.toFixed(4)}元/度</option>
              </select>
              <span style="font-size:0.9em; color:#666;">点击上方日期</span>
            </div>
          ` : ""}
          </div>
      </div>
    `;
  }

  renderTierInfo() {
    const yearStat = this.getYearStat();
    const yearNum = yearStat.num;
    const year = yearStat.year;
  
    let tier = 1;
    let color = '#09b69f';
    let text = '第一阶梯';
  
    if (yearNum > this._tier2_max) {
      tier = 3;
      color = '#F44336';
      text = '第三阶梯';
    } else if (yearNum > this._tier1_max) {
      tier = 2;
      color = '#e38800';
      text = '第二阶梯';
    }
  
    const isDark = this.isDarkMode();
  
    // 当前阶梯指示器的背景颜色始终使用白天模式的颜色，不跟随黑夜模式变化
    let currentIndicatorBgColor;
    if (tier === 1) {
      currentIndicatorBgColor = 'rgb(85, 197, 147)'; // 始终使用白天模式的第一阶梯颜色
    } else if (tier === 2) {
      currentIndicatorBgColor = 'rgb(248, 195, 55)'; // 始终使用白天模式的第二阶梯颜色
    } else if (tier === 3) {
      currentIndicatorBgColor = 'rgb(247, 147, 53)'; // 始终使用白天模式的第三阶梯颜色
    }
  
    let price = this._tier1_price;
    if (tier === 2) price = this._tier2_price;
    if (tier === 3) price = this._tier3_price;
  
    const totalWidth = 100;
    const tierWidthPercent = totalWidth / 3;
  
    let indicatorPosition = 0;
  
    // 修复：当用电量为0时，确保位置为0%
    if (yearNum <= 0) {
      indicatorPosition = 0;
    } else if (tier === 1) {
      indicatorPosition = (yearNum / this._tier1_max) * tierWidthPercent;
      // 确保不超过第一阶梯的范围
      indicatorPosition = Math.min(indicatorPosition, tierWidthPercent);
    } else if (tier === 2) {
      indicatorPosition = tierWidthPercent + ((yearNum - this._tier1_max) / (this._tier2_max - this._tier1_max)) * tierWidthPercent;
      // 确保在第二阶梯范围内
      indicatorPosition = Math.max(tierWidthPercent, Math.min(indicatorPosition, 2 * tierWidthPercent));
    } else if (tier === 3) {
      indicatorPosition = 2 * tierWidthPercent + ((yearNum - this._tier2_max) / 1000) * tierWidthPercent;
      // 确保不超过100%
      indicatorPosition = Math.min(indicatorPosition, totalWidth);
    }
  
    let leftOffset = 0;
    let rightOffset = 0;
  
    if (tier === 1) {
      leftOffset = 0;
      rightOffset = tierWidthPercent;
    } else if (tier === 2) {
      leftOffset = tierWidthPercent;
      rightOffset = 2 * tierWidthPercent;
    } else if (tier === 3) {
      leftOffset = 2 * tierWidthPercent;
      rightOffset = totalWidth;
    }
  
    // 计算当前阶梯指示器的位置
    let currentIndicatorLeft = 0;
    let currentIndicatorTransform = '';
    
    if (tier === 1) {
      // 当用电量为0时，将指示器放在最左侧
      if (yearNum <= 0) {
        currentIndicatorLeft = 0;
        currentIndicatorTransform = 'none';
      } else {
        currentIndicatorLeft = leftOffset;
        currentIndicatorTransform = 'none';
      }
    } else if (tier === 3) {
      currentIndicatorLeft = rightOffset;
      currentIndicatorTransform = 'translateX(-100%)';
    } else {
      currentIndicatorLeft = indicatorPosition;
      currentIndicatorTransform = 'translateX(-50%)';
    }
  
    const fullText = `${year}年 当前处于 第${tier}阶梯 ${yearNum.toFixed(1)}度 ${this.getYearStat().cost.toFixed(2)}元`;
  
    // 计算红色竖线和倒三角的最终位置
    const redLineLeft = Math.max(0, indicatorPosition);
    const triangleLeft = Math.max(0, indicatorPosition);
  
    return html`
      <div style="margin-top:12px; padding:8px; background:${isDark ? '#333' : '#fafbfc'}; border-radius:8px; text-align:center;padding-bottom:20px;">
        <!-- 添加一个内层容器，用于限制阶梯图的实际宽度 -->
        <div class="tier-indicator-container" style="position:relative; width:100%; max-width:420px; margin:0 auto;">
          <div class="tier-indicator" style="position:relative; margin:12px 0 0 0; padding:0; display:flex; align-items:center; justify-content:space-between;">
  
            <!-- 第一阶梯 -->
            <div class="tier tier-1" style="position:relative; flex:1; min-height:40px; display:flex; flex-direction:column; justify-content:flex-end; max-width:140px; top:13px; transition:top 0.3s ease;">
              <div class="tier-block" style="height:15px; display:flex; align-items:center; justify-content:center; padding:0 8px; border-radius:4px; font-size:10px; font-weight:600; text-align:center; line-height:1.2; z-index:1; box-shadow:0 2px 4px rgba(0,0,0,0.1); clip-path: polygon(0% 0%, calc(100% - 12px) 0%, 100% 50%, calc(100% - 12px) 100%, 0% 100%); margin-right:-10px; color:${isDark ? '#fff' : '#333'}; background-color: rgb(85, 197, 147);">
                第一阶梯
              </div>
              <div class="tier-content" style="margin-top:2px; text-align:center; font-size:11px; color:${isDark ? '#eee' : '#666'}; line-height:1.3; padding:6px 4px; border-radius:4px; background:${isDark ? 'linear-gradient(to bottom, #4cd96440 0%, #4cd96410 100%)' : 'linear-gradient(to bottom, rgb(213,250,237) 0%, rgba(237,252,245,0.3) 100%)'};">
                <div class="tier-range" style="margin-bottom:2px; color:${isDark ? '#ccc' : '#555'};">0-${this._tier1_max}度</div>
                <div class="tier-price" style="color:${isDark ? '#0ff' : '#2196f3'}; font-weight:500;">${this._tier1_price.toFixed(4)}元/度</div>
              </div>
            </div>
  
            <!-- 第二阶梯 -->
            <div class="tier tier-2" style="position:relative; flex:1; min-height:40px; display:flex; flex-direction:column; justify-content:flex-end; max-width:140px; top:13px; transition:top 0.3s ease;">
              <div class="tier-block" style="height:15px; display:flex; align-items:center; justify-content:center; padding:0 8px; border-radius:4px; font-size:10px; font-weight:600; text-align:center; line-height:1.2; z-index:1; box-shadow:0 2px 4px rgba(0,0,0,0.1); clip-path: polygon(0% 0%, calc(100% - 12px) 0%, 100% 50%, calc(100% - 12px) 100%, 0% 100%, 12px 50%); margin:0 -10px; color:${isDark ? '#fff' : '#333'}; background-color: rgb(248, 195, 55);">
                第二阶梯
              </div>
              <div class="tier-content" style="margin-top:2px; text-align:center; font-size:11px; color:${isDark ? '#eee' : '#666'}; line-height:1.3; padding:6px 4px; border-radius:4px; background:${isDark ? 'linear-gradient(to bottom right, #ffcc0040 0%, #ffcc0010 100%)' : 'linear-gradient(to bottom right, rgb(248,247,217) 0%, rgba(255,252,236,0.3) 100%)'};">
                <div class="tier-range" style="margin-bottom:2px; color:${isDark ? '#ccc' : '#555'};">${this._tier1_max + 1}-${this._tier2_max}度</div>
                <div class="tier-price" style="color:${isDark ? '#0ff' : '#2196f3'}; font-weight:500;">${this._tier2_price.toFixed(4)}元/度</div>
              </div>
            </div>
  
            <!-- 第三阶梯 -->
            <div class="tier tier-3" style="position:relative; flex:1; min-height:40px; display:flex; flex-direction:column; justify-content:flex-end; max-width:140px; top:13px; transition:top 0.3s ease;">
              <div class="tier-block" style="height:15px; display:flex; align-items:center; justify-content:center; padding:0 8px; border-radius:4px; font-size:10px; font-weight:600; text-align:center; line-height:1.2; z-index:1; box-shadow:0 2px 4px rgba(0,0,0,0.1); clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 12px 50%); margin-left:-10px; color:${isDark ? '#fff' : '#333'}; background-color: rgb(247, 147, 53);">
                第三阶梯
              </div>
              <div class="tier-content" style="margin-top:2px; text-align:center; font-size:11px; color:${isDark ? '#eee' : '#666'}; line-height:1.3; padding:6px 4px; border-radius:4px; background:${isDark ? 'linear-gradient(to bottom right, #ff6b6b40 0%, #ff6b6b10 100%)' : 'linear-gradient(to bottom right, rgb(253,240,224) 0%, rgba(254,245,238,0.3) 100%)'};">
                <div class="tier-range" style="margin-bottom:2px; color:${isDark ? '#ccc' : '#555'};">${this._tier2_max + 1}度以上</div>
                <div class="tier-price" style="color:${isDark ? '#0ff' : '#2196f3'}; font-weight:500;">${this._tier3_price.toFixed(4)}元/度</div>
              </div>
            </div>
  
            <!-- 红色竖线指示器 - 相对于内层容器定位 -->
            <div 
              class="red-line-indicator" 
              style="
                position:absolute; 
                top:13px; 
                left:${redLineLeft}%; 
                width:3px; 
                height:15px; 
                background-color:#ff0000; 
                z-index:8; 
                box-shadow:0 0 3px rgba(255,0,0,0.7); 
                transform:translateX(-50%);
              "
            ></div>
  
            <!-- 当前阶梯指示器 - 背景颜色始终使用白天模式的颜色 -->
            <div 
              class="current-indicator" 
              style="
                position:absolute; 
                top:-18px; 
                left:${currentIndicatorLeft}%; 
                transform:${currentIndicatorTransform}; 
                background-color:${currentIndicatorBgColor}; 
                color:white; 
                padding:4px 10px; 
                border-radius:10px; 
                font-size:11px; 
                font-weight:600; 
                white-space:nowrap; 
                box-shadow:0 2px 4px rgba(0,0,0,0.2); 
                z-index:10; 
                pointer-events:none; 
                min-width:auto; 
                max-width:300px; 
                overflow:hidden; 
                text-overflow:ellipsis;
                /* 当用电量为0时，确保在最左侧 */
                ${yearNum <= 0 ? 'left: 0%; transform: none;' : ''}
              "
            >
              ${fullText}
            </div>
  
            <!-- 添加倒三角指示器 - 确保与红色竖线完全对齐 -->
            <div 
              class="current-indicator-triangle" 
              style="
                position: absolute;
                top: 6px;
                left: ${triangleLeft}%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 4px solid transparent;
                border-right: 4px solid transparent;
                border-top: 4px solid ${currentIndicatorBgColor};
                z-index: 9;
                pointer-events: none;
              "
            ></div>
          </div>
        </div>
      </div>
    `;
  }
  _handleTierSelect(e) {
    const selectedValue = e.target.value;
    if (selectedValue) {
      const price = parseFloat(selectedValue);
      if (!isNaN(price)) {
        this._selectedTierPrice = price;
      } else {
        this._selectedTierPrice = null;
      }
    } else {
      this._selectedTierPrice = null;
    }
    this.requestUpdate();
  }
  formatMoney(value) {
    if (value === undefined || isNaN(value)) return '0';
    const fixed = value.toFixed(2);
    return fixed.replace(/\.?0+$/, '');
  }
  _showCustomModal(options) {
    if (this._modalOverlay) {
      this._modalOverlay.remove();
      this._modalOverlay = null;
    }

    const overlay = document.createElement('div');
    overlay.style = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 9999;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
      box-sizing: border-box;
    `;
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this._hideModal();
      }
    });

    const modal = document.createElement('div');
    modal.style = `
      background: ${this.isDarkMode() ? '#333' : '#fff'};
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      max-width: 320px;
      width: 100%;
      overflow: hidden;
      color: ${this.isDarkMode() ? '#ddd' : '#333'};
      font-family: "MiSans", sans-serif;
    `;

    const title = document.createElement('div');
    title.style = `
      padding: 12px 16px;
      background: ${this.isDarkMode() ? '#444' : '#f5f5f5'};
      font-weight: bold;
      font-size: 16px;
      border-bottom: 1px solid ${this.isDarkMode() ? '#555' : '#eee'};
    `;
    title.textContent = options.title || "提示";

    const content = document.createElement('div');
    content.style = "padding: 16px;";
    if (options.content instanceof HTMLElement) {
      content.appendChild(options.content);
    } else {
      content.innerHTML = options.content;
    }

    const footer = document.createElement('div');
    footer.style = `
      padding: 12px 16px;
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      border-top: 1px solid ${this.isDarkMode() ? '#555' : '#eee'};
      background: ${this.isDarkMode() ? '#444' : '#f5f5f5'};
    `;
    options.buttons?.forEach(btn => {
      const btnEl = document.createElement('button');
      btnEl.style = `
        padding: 6px 12px;
        border-radius: 6px;
        border: none;
        background: ${this.isDarkMode() ? '#555' : '#eee'};
        color: ${this.isDarkMode() ? '#ddd' : '#333'};
        cursor: pointer;
        font-size: 14px;
        transition: background 0.2s;
      `;
      btnEl.textContent = btn.text;
      btnEl.addEventListener('click', btn.action);
      btnEl.addEventListener('mouseenter', () => {
        btnEl.style.background = this.isDarkMode() ? '#666' : '#ddd';
      });
      btnEl.addEventListener('mouseleave', () => {
        btnEl.style.background = this.isDarkMode() ? '#555' : '#eee';
      });
      footer.appendChild(btnEl);
    });

    modal.appendChild(title);
    modal.appendChild(content);
    modal.appendChild(footer);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    this._modalOverlay = overlay;
  }
  
  _hideModal() {
    if (this._modalOverlay) {
      this._modalOverlay.remove();
      this._modalOverlay = null;
    }
  }

  _handleDayClick(dayStr, dObj) {
    if (this._iscar) return; // 如果是汽车模式，不响应点击

    if (!dObj || !dObj.num) {
      console.log("无用电数据，不响应点击");
      return;
    }

    if (!this._selectedTierPrice) {
      this._showToast("请先在下方选择一个电价单价！");
      return;
    }

    const electricity = dObj.num;
    const price = this._selectedTierPrice;
    const cost = (electricity * price).toFixed(2);

    this._showCustomModal({
      title: "日电费详情",
      content: `
        <div style="padding:16px; font-size:14px; line-height:1.6;">
          <div><strong>日期：</strong>${dayStr}</div>
          <div><strong>用电量：</strong>${electricity} 度</div>
          <div><strong>电价：</strong>${price} 元/度</div>
          <div><strong>电费：</strong><span style="color:#FFA500; font-weight:bold;">${cost} 元</span></div>
        </div>
      `,
      buttons: [
        { text: "关闭", action: () => this._hideModal() }
      ]
    });
  }
    
  async _renderApexDay(dayList, color_num, color_cost) {
    if (!window.ApexCharts) {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/apexcharts";
      document.head.appendChild(s);
      s.onload = () => this._renderApexDay(dayList, color_num, color_cost);
      return;
    }
    if (!dayList || dayList.length === 0) return;
  
    const selectedTierPrice = this._selectedTierPrice;
    const isDark = this.isDarkMode();
  
    const eleData = dayList.map(x => ({ x: x.day, y: x.num || 0 }));
  
    const options = {
      series: [{
        name: '用电量',
        data: eleData
      }],
      chart: {
        type: 'bar',
        height: 200,
        width: '100%',
        toolbar: { show: false },
        animations: { enabled: true },
        background: isDark ? '#333' : '#fff',
        foreColor: isDark ? '#ddd' : '#333',
        responsive: [{
          breakpoint: 480,
          options: {
            chart: { width: '100%' },
            xaxis: {
              labels: {
                rotation: -75,     // ✅ 使用 rotation（官方推荐）
                fontSize: '8px',   // ✅ 手机端缩小字体
                hideOverlappingLabels: false,  // ✅ 强制显示所有标签
                textAnchor: 'end', // ✅ 右对齐
                minHeight: 40      // ✅ 关键：分配最小高度，避免挤压
              }
            }
          }
        }],
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        parentHeightOffset: 0,
        redrawOnWindowResize: true
      },
      colors: [color_num],
      plotOptions: {
        bar: {
          columnWidth: '60%',
          dataLabels: { enabled: false }
        }
      },
      dataLabels: { enabled: false },
      xaxis: {
        type: 'category',
        labels: {
          rotation: -75,         // ✅ 使用 rotation
          style: { fontSize: '8px', color: isDark ? '#ddd' : '#333' },
          hideOverlappingLabels: false,  // ✅ 强制显示所有标签
          textAnchor: 'end',     // ✅ 右对齐
          minHeight: 40          // ✅ 分配最小高度
        }
      },
      yaxis: {
        min: 0,
        title: {
          text: '度',
          style: { color: isDark ? '#ddd' : '#333', fontSize: '12px', fontWeight: 'bold' }
        },
        labels: {
          offsetX: -3,
          style: { color: isDark ? '#ddd' : '#333' }
        }
      },
      tooltip: {
        theme: isDark ? 'dark' : 'light',
        custom: function({ series, seriesIndex, dataPointIndex, w }) {
          const val = series[seriesIndex][dataPointIndex];
          const dayStr = eleData[dataPointIndex].x;
          const dObj = dayList.find(x => x.day === dayStr);
  
          if (!dObj || !dObj.num) {
            return `<div style="padding:8px; font-size:12px; color:${isDark ? '#ddd' : '#333'};">
                      <span style="color:#09b69f; font-weight:bold; margin-right:4px;">●</span>
                      无用电数据
                    </div>`;
          }
  
          let content = `<div style="padding:8px; font-size:12px; line-height:1.5; color:${isDark ? '#ddd' : '#333'};">`;
          content += `<span style="color:#09b69f; font-weight:bold; margin-right:4px;">●</span>用电量：${val}度`;
  
          const price = this._selectedTierPrice;
  
          if (price && !isNaN(price)) {
            const cost = (val * price).toFixed(2);
            content += `<br><span style="color:#770ef6; font-weight:bold; margin-right:4px;">●</span>电费：${cost}元`;
          }
  
          content += `</div>`;
          return content;
        }.bind(this)
      },
      grid: {
        yaxis: { lines: { show: false } },
        xaxis: { lines: { show: true, color: isDark ? '#444' : '#eee' } },
        padding: { top: 0, right: 0, bottom: 0, left: 0 }
      }
    };
  
    const el = this.shadowRoot.getElementById("df_day_chart");
    if (el) {
      el.innerHTML = "";
      const chart = new ApexCharts(el, options);
      el._apexChartInstance = chart;
      chart.render();
    }
  }
              
  async _renderApexMonth(monthList, lastMonthList, color_num, color_cost) {
    if (!window.ApexCharts) {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/apexcharts";
      document.head.appendChild(s);
      s.onload = () => this._renderApexMonth(monthList, lastMonthList, color_num, color_cost);
      return;
    }

    const currentPage = this._currentMonthPage;

    let currentData = monthList;

    if (lastMonthList && lastMonthList.length > 0 && currentPage === 1) {
      const monthYear = this.getYearStat().year;
      const lastMonthYear = lastMonthList[0]?.month?.substring(0,4) || '';
      if (monthYear !== lastMonthYear) {
        currentData = lastMonthList;
      }
    }

    if (!currentData || currentData.length === 0) return;

    const shouldRender = 
      !this._lastRenderedMonthPage || 
      this._lastRenderedMonthPage !== currentPage ||
      !this._lastRenderedMonthData || 
      JSON.stringify(this._lastRenderedMonthData) !== JSON.stringify(currentData);

    if (!shouldRender) return;

    this._lastRenderedMonthPage = currentPage;
    this._lastRenderedMonthData = [...currentData];

    const isDark = this.isDarkMode();

    const eleData = currentData.map(x => ({ x: x.month, y: x.num || 0 }));
    const costData = currentData.map(x => ({ x: x.month, y: x.cost || 0 }));

    const options = {
      series: [
        { name: '用电量', type: 'column', data: eleData },
        { name: '电费', type: 'line', data: costData }
      ],
      chart: {
        type: 'line',
        height: 200,
        width: '100%',
        toolbar: { show: false },
        animations: { enabled: true },
        background: isDark ? '#333' : '#fff',
        foreColor: isDark ? '#ddd' : '#333',
        responsive: [{
          breakpoint: 480,
          options: {
            chart: { width: '100%' },
            xaxis: {
              labels: {
                rotate: -75,
                fontSize: '9px',
                hideOverlappingLabels: true,
                textAnchor: 'end',
                style: { color: isDark ? '#ddd' : '#333' }
              }
            }
          }
        }],
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        parentHeightOffset: 0,
        redrawOnWindowResize: true
      },
      colors: [color_num, color_cost],
      stroke: { width: [2, 2] },
      xaxis: {
        type: 'category',
        tickPlacement: 'between',
        labels: {
          rotate: -75,
          style: { fontSize: '9px', color: isDark ? '#ddd' : '#333' },
          hideOverlappingLabels: true,
          textAnchor: 'end',
        }
      },
      yaxis: [
        {
          title: {
            text: '度',
            style: { color: isDark ? '#ddd' : '#333', fontSize: '12px', fontWeight: 'bold' }
          },
          min: 0,
          labels: {
            offsetX: -3,
            style: { color: isDark ? '#ddd' : '#333' }
          }
        },
        {
          opposite: true,
          title: {
            text: '元',
            style: { color: isDark ? '#ddd' : '#333', fontSize: '12px', fontWeight: 'bold' }
          },
          min: 0,
          labels: {
            style: { color: isDark ? '#ddd' : '#333' },
            formatter: val => val.toFixed(2)
          }
        }
      ],
      tooltip: {
        theme: isDark ? 'dark' : 'light',
        y: {
          formatter: (val, opts) => {
            if (opts.seriesIndex === 0) return val + "度";
            if (opts.seriesIndex === 1) return val + "元";
          }
        },
        style: { fontSize: '12px', fontFamily: 'MiSans' }
      },
      grid: {
        yaxis: { lines: { show: false } },
        xaxis: { lines: { show: true, color: isDark ? '#444' : '#eee' } },
        padding: { top: 0, right: 0, bottom: 0, left: 0 }
      }
    };

    const el = this.shadowRoot.getElementById("df_month_chart");
    if (el) {
      el.innerHTML = "";
      new ApexCharts(el, options).render();
    }
  }
}

customElements.define('home-state-grid-card', CustomStateGridInfoQinglong);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'home-state-grid-card',
  name: '家庭用电国网数据卡片',
  description: '适配单个整合实体的国网简捷卡牌，支持阶梯电价与年度统计'
});
