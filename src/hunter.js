const puppeteer = require('puppeteer')

const Agency = require('./agency')
const EmailService = require('./email')

const agencies = require('./agencies.json')

async function initHunter () {
  const browser = await puppeteer.launch()
  const properties = []

  for (const agency of agencies) {
    const agencyInstance = new Agency(browser, agency)

    const agencyProperties = await agencyInstance.seekProperties()

    if (agencyProperties.length) {
      properties.push({
        name: agency.name,
        properties: agencyProperties
      })
    }
  }

  if (properties.length) {
    const emailService = new EmailService()
    await emailService.sendEmail(properties)
  }

  await browser.close()
}

module.exports = initHunter
