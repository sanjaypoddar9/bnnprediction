// ज्योतिषीय गणना फंक्शंस
class AstrologyCalculator {
  constructor() {
    this.planetNames = ["सूर्य", "चंद्र", "मंगल", "बुध", "गुरु", "शुक्र", "शनि", "राहु", "केतु"];
    this.rashiNames = ["मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तुला", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन"];
    this.nakshatraNames = ["अश्विनी", "भरणी", "कृतिका", "रोहिणी", "मृगशिरा", "आर्द्रा", "पुनर्वसु", "पुष्य", "आश्लेषा", 
                          "मघा", "पूर्व फाल्गुनी", "उत्तर फाल्गुनी", "हस्त", "चित्रा", "स्वाती", "विशाखा", "अनुराधा", 
                          "ज्येष्ठा", "मूल", "पूर्वाषाढ़ा", "उत्तराषाढ़ा", "श्रवण", "धनिष्ठा", "शतभिषा", "पूर्व भाद्रपद", 
                          "उत्तर भाद्रपद", "रेवती"];
    this.dashaOrder = ["सूर्य", "चंद्र", "मंगल", "राहु", "गुरु", "शनि", "बुध", "केतु", "शुक्र"];
    this.dashaDurations = [6, 10, 7, 18, 16, 19, 17, 7, 20]; // वर्षों में
  }

  // जूलियन डेट गणना
  getJulianDate(date) {
    return date.getTime() / 86400000 + 2440587.5;
  }

  // स्थानीय सिद्धांत समय (LST)
  calculateLST(jd, longitude) {
    const t = (jd - 2451545.0) / 36525;
    let theta = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 
                0.000387933 * t * t - t * t * t / 38710000;
    theta = (theta % 360 + 360) % 360;
    return (theta + longitude) / 15;
  }

  // अयनांश गणना (लाहिरी)
  calculateAyanamsa(jd) {
    const t = (jd - 2451545.0) / 36525;
    return 25 + (50.26 + 0.22 * t) * t;
  }

  // लग्न गणना
  calculateLagna(birthDate, birthTime, latitude, longitude) {
    const utcDate = new Date(birthDate + 'T' + birthTime + 'Z');
    const jd = this.getJulianDate(utcDate);
    const lst = this.calculateLST(jd, longitude);
    const ayanamsa = this.calculateAyanamsa(jd);
    const siderealTime = (lst * 15 + ayanamsa) % 360;
    const ascendant = (siderealTime / 30) % 12;
    return this.rashiNames[Math.floor(ascendant)];
  }

  // ग्रह स्थिति गणना (सरलीकृत)
  calculatePlanetPositions(jd) {
    const t = (jd - 2451545.0) / 36525;
    const ayanamsa = this.calculateAyanamsa(jd);
    
    // ग्रहों की स्थिति (सरलीकृत गणना)
    const positions = {
      सूर्य: (280.46646 + 36000.76983 * t) % 360,
      चंद्र: (218.31617 + 481267.88088 * t) % 360,
      मंगल: (355.433 + 19141.6964471 * t) % 360,
      बुध: (178.179078 + 149474.07078 * t) % 360,
      गुरु: (34.351484 + 3036.3027889 * t) % 360,
      शुक्र: (50.416381 + 58517.8151956 * t) % 360,
      शनि: (113.663404 + 1223.5110686 * t) % 360,
      राहु: (125.044555 - 1934.1362611 * t) % 360,
      केतु: (125.044555 - 1934.1362611 * t + 180) % 360
    };
    
    // परिणाम तैयार करें
    const result = {};
    for (const [planet, longitude] of Object.entries(positions)) {
      const adjustedLong = (longitude - ayanamsa + 360) % 360;
      const rashi = Math.floor(adjustedLong / 30);
      const nakshatra = Math.floor(adjustedLong / (360/27));
      const pada = Math.floor((adjustedLong % (360/27)) / (360/108)) + 1;
      
      result[planet] = {
        राशि: this.rashiNames[rashi],
        भाव: this.calculateBhava(adjustedLong),
        नक्षत्र: this.nakshatraNames[nakshatra],
        पाद: pada,
        डिग्री: adjustedLong % 30
      };
    }
    
    return result;
  }

  // भाव गणना (सरलीकृत)
  calculateBhava(longitude) {
    return (Math.floor(longitude / 30) + 1) % 12 || 12;
  }

  // विम्शोत्तरी दशा गणना
  calculateVimshottariDasha(birthDate, birthTime) {
    const utcDate = new Date(birthDate + 'T' + birthTime + 'Z');
    const jd = this.getJulianDate(utcDate);
    const moonLong = (218.31617 + 481267.88088 * ((jd - 2451545.0) / 36525)) % 360;
    const ayanamsa = this.calculateAyanamsa(jd);
    const moonLongCorrected = (moonLong - ayanamsa + 360) % 360;
    const nakshatra = Math.floor(moonLongCorrected / (360/27));
    
    // दशा शेष गणना
    const remainder = moonLongCorrected % (360/27);
    const balance = (360/27 - remainder) * (27/360) * this.dashaDurations[nakshatra % 9];
    
    const dashas = [];
    const startDate = new Date(birthDate + 'T' + birthTime + 'Z');
    
    for(let i=0; i<9; i++) {
      const dashaIndex = (nakshatra + i) % 9;
      const duration = i === 0 ? balance : this.dashaDurations[dashaIndex];
      
      dashas.push({
        दशा: this.dashaOrder[dashaIndex],
        अवधि: duration,
        प्रारंभ: new Date(startDate)
      });
      
      // अगली दशा का प्रारंभ तिथि जोड़ें
      startDate.setFullYear(startDate.getFullYear() + (i === 0 ? balance : this.dashaDurations[dashaIndex]));
    }
    
    return dashas;
  }

  // लाल किताब उपाय जनरेटर
  generateLalKitabRemedies(planetPositions) {
    const remedies = [];
    
    // मंगल शांति
    if(planetPositions["मंगल"].भाव === 8 || planetPositions["मंगल"].भाव === 12) {
      remedies.push({
        उपाय: "मंगलवार को गुड़ और मसूर दाल का दान करें",
        कारण: "अष्टम/द्वादश भाव में मंगल"
      });
    }
    
    // शनि शांति
    if(planetPositions["शनि"].भाव === 1 || planetPositions["शनि"].भाव === 8) {
      remedies.push({
        उपाय: "शनिवार को काले तिल और सरसों तेल दान करें",
        कारण: "लग्न/अष्टम भाव में शनि"
      });
    }
    
    // राहु-केतु
    if(planetPositions["राहु"].भाव === 1 || planetPositions["केतु"].भाव === 1) {
      remedies.push({
        उपाय: "हनुमान चालीसा का नियमित पाठ करें",
        कारण: "लग्न में राहु/केतु"
      });
    }
    
    // धन लाभ
    if(planetPositions["गुरु"].भाव === 2 || planetPositions["गुरु"].भाव === 11) {
      remedies.push({
        उपाय: "गुरुवार को पीले फूल और चने की दाल दान करें",
        कारण: "धन/लाभ भाव में गुरु"
      });
    }
    
    return remedies;
  }
}

// UI इंटरैक्शन और रिपोर्ट जनरेशन
document.addEventListener('DOMContentLoaded', function() {
  const calculator = new AstrologyCalculator();
  const kundaliForm = document.getElementById("kundaliForm");
  const reportBox = document.getElementById("reportBox");
  
  kundaliForm.addEventListener("submit", function(e) {
    e.preventDefault();
    
    // फॉर्म डेटा प्राप्त करें
    const name = document.getElementById("name").value;
    const dob = document.getElementById("dob").value;
    const tob = document.getElementById("tob").value;
    const pob = document.getElementById("pob").value;
    const gender = document.getElementById("gender").value;
    
    // लोडिंग दिखाएं
    const submitBtn = document.getElementById("submitBtn");
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span> प्रसंस्करण...';
    
    // ज्योतिषीय गणना करें (सेटटाइमआउट सिम्युलेशन के लिए)
    setTimeout(() => {
      const birthDate = new Date(dob + 'T' + tob + 'Z');
      const jd = calculator.getJulianDate(birthDate);
      
      // कुंडली विवरण
      const lagna = calculator.calculateLagna(dob, tob, 28.6139, 77.2090); // दिल्ली के लिए स्थान
      const planetPositions = calculator.calculatePlanetPositions(jd);
      const dashas = calculator.calculateVimshottariDasha(dob, tob);
      const remedies = calculator.generateLalKitabRemedies(planetPositions);
      
      // रिपोर्ट भरें
      fillReport({
        name, dob, tob, pob, gender,
        lagna, planetPositions, dashas, remedies
      });
      
      // लोडिंग हटाएं
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-chart-line"></i> विस्तृत रिपोर्ट प्राप्त करें';
    }, 1500);
  });
  
  // रिपोर्ट भरने का फंक्शन
  function fillReport(data) {
    // बेसिक इंफो
    document.getElementById("basicKundaliInfo").innerHTML = `
      <p><strong>नाम:</strong> ${data.name}</p>
      <p><strong>जन्म तिथि:</strong> ${new Date(data.dob).toLocaleDateString('hi-IN')}</p>
      <p><strong>जन्म समय:</strong> ${data.tob}</p>
      <p><strong>जन्म स्थान:</strong> ${data.pob}</p>
      <p><strong>लग्न:</strong> ${data.lagna}</p>
    `;
    
    // ग्रह स्थिति टेबल
    let tableHTML = '';
    for (const [planet, info] of Object.entries(data.planetPositions)) {
      tableHTML += `
        <tr>
          <td>${planet}</td>
          <td>${info.राशि}</td>
          <td>${info.भाव}</td>
          <td>${info.नक्षत्र} (${info.पाद} पाद)</td>
          <td>${info.डिग्री.toFixed(2)}°</td>
        </tr>
      `;
    }
    document.getElementById("planetTable").innerHTML = tableHTML;
    
    // दशा विवरण
    let dashaHTML = '';
    data.dashas.forEach((dasha, index) => {
      if(index < 3) { // केवल पहली 3 दशाएं दिखाएं
        dashaHTML += `
          <div class="timeline-event">
            <span class="timeline-year">${dasha.दशा} दशा (${dasha.अवधि.toFixed(2)} वर्ष):</span>
            <p>${getDashaDescription(dasha.दशा, data.planetPositions)}</p>
          </div>
        `;
      }
    });
    document.getElementById("lifeEventsTimeline").innerHTML = dashaHTML;
    
    // लाल किताब उपाय
    let remediesHTML = '';
    data.remedies.forEach(remedy => {
      remediesHTML += `
        <div class="remedy-item">
          <i class="fas fa-hands-helping remedy-icon"></i>
          <div>
            <strong>${remedy.उपाय}</strong><br>
            <em>${remedy.कारण}</em>
          </div>
        </div>
      `;
    });
    document.getElementById("lalKitabRemedies").innerHTML = remediesHTML;
    
    // रिपोर्ट दिखाएं
    reportBox.style.display = 'block';
    reportBox.scrollIntoView({ behavior: 'smooth' });
  }
  
  // दशा विवरण जनरेटर
  function getDashaDescription(dashaLord, planetPositions) {
    const descriptions = {
      सूर्य: "सूर्य दशा में आत्मविश्वास और करियर में प्रगति के योग।",
      चंद्र: "चंद्र दशा में भावनात्मक उतार-चढ़ाव और पारिवारिक मामलों में व्यस्तता।",
      // अन्य ग्रहों के विवरण...
    };
    
    return descriptions[dashaLord] || `${dashaLord} दशा सक्रिय होगी।`;
  }
  
  // PDF जनरेटर
  window.generateDetailedPDF = function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // PDF कंटेंट जोड़ें
    doc.setFont("helvetica", "normal");
    doc.setFontSize(18);
    doc.setTextColor(179, 84, 30);
    doc.text("विस्तृत ज्योतिषीय रिपोर्ट", 105, 15, { align: 'center' });
    
    // बेसिक इंफो
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("जन्म कुंडली विवरण:", 15, 25);
    doc.text(`नाम: ${document.getElementById("r_name").textContent}`, 15, 33);
    // अन्य डिटेल्स...
    
    doc.save(`jyotish_report_${document.getElementById("r_name").textContent}.pdf`);
  };
  
  // फॉर्म रीसेट
  window.resetForm = function() {
    kundaliForm.reset();
    reportBox.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // चैट फंक्शनैलिटी
  window.handleUserInput = function() {
    const userInput = document.getElementById("userInput");
    const message = userInput.value.trim();
    if (!message) return;
    
    // यूजर मैसेज जोड़ें
    addMessage(message, 'user');
    userInput.value = '';
    
    // टाइपिंग इंडिकेटर
    const typingIndicator = addMessage('टाइपिंग...', 'bot');
    
    // बॉट रिस्पांस (सेटटाइमआउट सिम्युलेशन के लिए)
    setTimeout(() => {
      // टाइपिंग इंडिकेटर हटाएं
      document.getElementById("chatbox").removeChild(typingIndicator);
      
      // रिस्पांस जनरेट करें
      const response = generateBotResponse(message);
      addMessage(response, 'bot');
    }, 1500);
  };
  
  function addMessage(text, sender) {
    const chatbox = document.getElementById("chatbox");
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    
    if (sender === 'bot') {
      messageDiv.innerHTML = `<strong>ज्योतिष सहायक:</strong> ${text}`;
    } else {
      messageDiv.innerHTML = `<strong>आप:</strong> ${text}`;
    }
    
    chatbox.appendChild(messageDiv);
    chatbox.scrollTop = chatbox.scrollHeight;
    return messageDiv;
  }
  
  function generateBotResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('शादी') || lowerMessage.includes('विवाह')) {
      return "आपकी कुंडली के अनुसार, शुक्र और सप्तम भाव की स्थिति बताती है कि आपकी शादी 27-30 वर्ष की आयु के बीच होने की संभावना है। शुक्रवार को सफेद फूलों का दान करना शुभ रहेगा।";
    } 
    else if (lowerMessage.includes('करियर') || lowerMessage.includes('नौकरी')) {
      return "दशम भाव में गुरु की स्थिति उत्तम है। आपको सरकारी क्षेत्र में सफलता मिल सकती है। राहु की दशा में विदेश में करियर के अवसर भी बन सकते हैं।";
    }
    else {
      return "कृपया अपना जन्म विवरण दर्ज करें ताकि मैं आपकी कुंडली के अनुसार सटीक भविष्यवाणी कर सकूँ। आप 'विस्तृत रिपोर्ट प्राप्त करें' बटन पर क्लिक करके अपना जन्म विवरण दर्ज कर सकते हैं।";
    }
  }
});