const db = require('./db')

class Agency {
  constructor (browser, agency) {
    this.browser = browser
    this.agency = agency
  }

  async seekProperties () {
    console.log('')
    console.log('****************************************')
    console.log('')
    console.log(`========== ${this.agency.name} start ==========`)

    await this.visitWebsite()
    await this.applyFilters()
    const properties = await this.collectProperties()

    if (properties.length) {
      await this.saveProperties(properties)
    }

    this.page.close()
    console.log(`========== ${this.agency.name} end ==========`)
    return properties
  }

  async visitWebsite () {
    this.page = await this.browser.newPage()

    console.log('Visiting website…')
    await this.page.goto(this.agency.url)
  }

  async applyFilters () {
    if (!this.agency.filters) { return }

    console.log('Filtering properties…')
    for (const filter of this.agency.filters) {
      await this.page[filter.action](...filter.args)
    }
  }

  async collectProperties () {
    const properties = await this.page.$$eval(
      this.agency.uniqueReferenceSelector, properties => {
        return properties.map(property => property.href)
      }
    )

    const knownProperties = await this.fetchKnownProperties()
    const newProperties = properties.filter(property => knownProperties.indexOf(property) === -1)
    console.log(`Found ${properties.length} available properties (${newProperties.length} new)`)
    return newProperties
  }

  async fetchKnownProperties () {
    return db.fetch(this.agency.name).catch(console.dir)
  }

  async saveProperties (newProperties) {
    console.log('Storing new properties…')
    return db.store(this.agency.name, newProperties)
  }
}

module.exports = Agency
