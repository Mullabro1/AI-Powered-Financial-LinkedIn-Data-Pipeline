import puppeteer from 'puppeteer-core';

export async function scrapeData(url) {
  //let browser;
  const BROWSER_WS = "wss://brd-customer-hl_6135849a-zone-scraping_browser3:0odldr3b50iy@brd.superproxy.io:9222";

  let browser = null;
    try {
        console.log('Connecting to Scraping Browser...');
        const browser = await puppeteer.connect({
            browserWSEndpoint: BROWSER_WS,
        });
    
    
    //browser = await puppeteer.launch({ headless: true }); // Launch the browser in headless mode
    
    const page = await browser.newPage();


    /*console.log("Connecting to browser...");
  const browser = await puppeteer.connect({
    browserWSEndpoint: BROWSER_WS,
  });

  
  
  const BROWSER_WS = "wss://brd-customer-hl_6135849a-zone-scraping_browser2:43rl486usbeh@brd.superproxy.io:9222";

  const URL = "https://www.booking.com/";

 *//*const proxyUrl = 'wss://brd-customer-hl_6135849a-zone-scraping_browser2:43rl486usbeh@brd.superproxy.io:9222';

  // Launch Puppeteer with the proxy
  const browser = await puppeteer.launch({
    headless: false,  // Set to true if you want it headless
    args: [
      `--proxy-server=${proxyUrl}`  // Specify the proxy server
    ]
  });
*/
    // Navigate to the LinkedIn profile page
    await page.goto(url, {
      waitUntil: 'networkidle2', // Wait for 2 network connections to be idle
      timeout: 60000, // Set the timeout to 60 seconds
    });

    // Wait for necessary elements to load
    await page.waitForSelector('.top-card-layout__title', { timeout: 60000 });
    //await page.waitForSelector('section.profile', { visible: true, timeout: 60000 });


    // Scrape the data from the page
    const profileData = await page.evaluate(() => {
      // Scrape the "Name" and "Job Title" sections
      const name = document.querySelector('.top-card-layout__title')?.textContent.trim() || 'N/A';
      const jobTitle = document.querySelector('.top-card-layout__headline')?.textContent.trim() || 'N/A';

      // Scrape the "Location" section
      const loca = document.querySelector('.profile-info-subheader .not-first-middot span')?.textContent.trim() || 'N/A';

      // Scrape the "About" section
      const aboutSection = document.querySelector('.core-section-container[data-section="summary"]');
      const aboutText = aboutSection ? aboutSection.querySelector('.core-section-container__content p')?.innerText.trim() : 'N/A';

      // Scrape the "Experience" section
      const experienceSection = document.querySelector('.core-section-container[data-section="experience"]');
      let experienceData = [];
      if (experienceSection) {
        const experienceItems = Array.from(experienceSection.querySelectorAll('ul.experience__list li.profile-section-card'));
        if (experienceItems.length > 0) {
          experienceData = experienceItems.map(item => {
            const company = item.querySelector('.experience-item__subtitle')?.innerText.trim() || 'N/A';
            const title = item.querySelector('.experience-item__title')?.innerText.trim() || 'N/A';
            const duration = item.querySelector('.date-range')?.innerText.trim() || 'N/A';
            const location = item.querySelectorAll('.experience-item__meta-item')[1]?.innerText.trim() || 'N/A';
            const description = item.querySelector('.show-more-less-text__text--less')?.innerText.trim() || 'N/A';

            return { company, title, duration, location, description };
          });
        } else {
          experienceData = 'N/A';
        }
      } else {
        experienceData = 'N/A';
      }

      // Scrape the "Education" section
      const educationSection = document.querySelector('.core-section-container[data-section="educationsDetails"]');
      let educationData = [];
      if (educationSection) {
        const educationItems = Array.from(educationSection.querySelectorAll('ul.education__list li.profile-section-card'));
        if (educationItems.length > 0) {
          educationData = educationItems.map(item => {
            const schoolNameElement = item.querySelector('h3 a');
            const schoolName = schoolNameElement ? schoolNameElement.innerText.trim() : 'N/A';
            const degreeFieldElement = item.querySelector('h4');
            const degreeField = degreeFieldElement ? degreeFieldElement.innerText.trim() : 'N/A';
            const dateRange = item.querySelector('.date-range');
            let startYear = 'N/A';
            let endYear = 'N/A';

            if (dateRange) {
              const dates = dateRange.querySelectorAll('time');
              if (dates.length === 2) {
                startYear = dates[0]?.innerText.trim() || 'N/A';
                endYear = dates[1]?.innerText.trim() || 'N/A';
              }
            }

            return { schoolName, degreeField, startYear, endYear };
          });
        } else {
          educationData = 'N/A';
        }
      } else {
        educationData = 'N/A';
      }

      // Scrape "Licenses & Certifications" section
      const certificationsSection = document.querySelector('.core-section-container[data-section="certifications"]');
      let certificationsData = [];
      if (certificationsSection) {
        const certItems = Array.from(certificationsSection.querySelectorAll('ul li.profile-section-card'));
        if (certItems.length > 0) {
          certificationsData = certItems.map(item => {
            const certName = item.querySelector('h3')?.innerText.trim() || 'N/A';
            const issuer = item.querySelector('h4 a')?.innerText.trim() || 'N/A';
            const issueDate = item.querySelector('div span time')?.innerText.trim() || 'N/A';
            const expirationDate = item.querySelectorAll('div span time')[1]?.innerText.trim() || 'N/A';
            const credentialId = item.querySelector('div > div')?.innerText.replace('Credential ID', '').trim() || 'N/A';

            return { certName, issuer, issueDate, expirationDate, credentialId };
          });
        } else {
          certificationsData = 'N/A';
        }
      } else {
        certificationsData = 'N/A';
      }

      // Scrape the "Projects" section
      const projectsSection = document.querySelector('.core-section-container[data-section="projects"]');
      let projectsData = [];
      if (projectsSection) {
        const projectItems = Array.from(projectsSection.querySelectorAll('ul.projects__list li.profile-section-card'));
        if (projectItems.length > 0) {
          projectsData = projectItems.map(item => {
            const projectName = item.querySelector('h3 a')?.innerText.trim() || 'N/A';
            const projectDescription = item.querySelector('.show-more-less-text__text--less')?.innerText.trim() || 'N/A';
            const projectDateRange = item.querySelector('.date-range')?.innerText.trim() || 'N/A';
            const projectLink = item.querySelector('h3 a')?.href || 'N/A';

            return { projectName, projectDescription, projectDateRange, projectLink };
          });
        } else {
          projectsData = 'N/A';
        }
      } else {
        projectsData = 'N/A';
      }

      // Scrape the profile image URL
      const profileImageUrl = document.querySelector('img.top-card__profile-image')?.src || 'N/A';

      return { name, jobTitle, loca, aboutText, experienceData, educationData, certificationsData, projectsData, profileImageUrl };
    });

    return profileData;

  } catch (error) {
    console.error('Error scraping LinkedIn profile:', error);
    return { error: 'Failed to scrape profile data' };
  } finally {
    if (browser) {
      await browser.close(); // Always ensure the browser is closed
    }
  }
}
