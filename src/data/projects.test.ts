import { describe, expect, it } from 'vitest'

import { getFeaturedProjects, getProjects, type Project } from './projects'

const base: Project = {
  id: 'x',
  title: 'X',
  label: 'L',
  description: 'D',
  tags: [],
  repositoryUrl: 'https://example.invalid/x',
  image: 'images/projects/x.jpg',
  imageAlt: 'x',
  imageKind: 'illustration',
  imageWidth: 1200,
  imageHeight: 750,
  featured: true,
  order: 1,
}

describe('getFeaturedProjects', () => {
  it('ordina per `order` e scarta i progetti non in evidenza', () => {
    const list: Project[] = [
      { ...base, id: 'c', order: 3 },
      { ...base, id: 'hidden', order: 0, featured: false },
      { ...base, id: 'a', order: 1 },
      { ...base, id: 'b', order: 2 },
    ]

    expect(getFeaturedProjects(list).map((project) => project.id)).toEqual([
      'a',
      'b',
      'c',
    ])
  })

  it('regge un numero di progetti diverso da tre', () => {
    expect(getFeaturedProjects([])).toHaveLength(0)
    expect(getFeaturedProjects([base])).toHaveLength(1)
    expect(
      getFeaturedProjects([base, { ...base, id: 'y', order: 2 }, { ...base, id: 'z', order: 3 }, { ...base, id: 'w', order: 4 }]),
    ).toHaveLength(4)
  })
})

describe('dati dei progetti', () => {
  const projects = getProjects('it')

  it('non contiene id duplicati né `order` duplicati', () => {
    const ids = projects.map((project) => project.id)
    const orders = projects.map((project) => project.order)
    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(orders).size).toBe(orders.length)
  })

  it('punta sempre a un repository GitHub e mai a una demo non verificata', () => {
    for (const project of projects) {
      expect(project.repositoryUrl).toMatch(/^https:\/\/github\.com\//)
      if (project.demoUrl !== undefined) {
        expect(project.demoUrl).toMatch(/^https:\/\//)
      }
    }
  })
})

describe('traduzioni dei progetti', () => {
  it('espone gli stessi progetti in italiano e in inglese', () => {
    const italian = getProjects('it')
    const english = getProjects('en')

    expect(english.map((p) => p.id)).toEqual(italian.map((p) => p.id))
    for (const [index, project] of english.entries()) {
      // Parte tecnica condivisa: cambia solo la copy.
      expect(project.repositoryUrl).toBe(italian[index].repositoryUrl)
      expect(project.image).toBe(italian[index].image)
      expect(project.description).not.toBe(italian[index].description)
      expect(project.imageAlt.length).toBeGreaterThan(10)
    }
  })
})
