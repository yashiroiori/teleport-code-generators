import { ProjectUIDL } from '@teleporthq/teleport-types'
import { createProjectGenerator } from '../src'
import { resolveLocalDependencies } from '../src/utils'
import { mockMapping, firstStrategy, secondStrategy } from './mocks'

// @ts-ignore
import projectUIDL from '../../../examples/test-samples/project-sample.json'

describe('Generic Project Generator', () => {
  describe('with the same component generator for pages and components', () => {
    const generator = createProjectGenerator(firstStrategy)
    const { generator: componentsGenerator } = firstStrategy.components
    const { generator: routerGenerator } = firstStrategy.router
    const { generator: entryGenerator } = firstStrategy.entry

    it('creates an instance of a project generator', () => {
      expect(generator.generateProject).toBeDefined()
      expect(generator.getAssetsPath).toBeDefined()
      expect(generator.addMapping).toBeDefined()
    })

    it('sets the default assets prefix', () => {
      expect(generator.getAssetsPath()).toBe('test/static')
    })

    it('sends the mapping to the component generators', () => {
      generator.addMapping(mockMapping)
      expect(componentsGenerator.addMapping).toBeCalledTimes(1)
      expect(componentsGenerator.addMapping).toBeCalledWith(mockMapping)
    })

    it('calls the generators according to the strategy', async () => {
      await generator.generateProject(projectUIDL)

      const uidl = projectUIDL as ProjectUIDL

      // This adds the local dependencies on the UIDL, so we can proper assert below
      resolveLocalDependencies([], uidl.components, firstStrategy)

      expect(componentsGenerator.generateComponent).toBeCalledTimes(7)
      expect(componentsGenerator.generateComponent).toBeCalledWith(
        expect.objectContaining({ name: 'ExpandableArea' }),
        {
          assetsPrefix: '/test/static',
          projectRouteDefinition: uidl.root.stateDefinitions.route,
          mapping: {},
          skipValidation: true,
        }
      )
      expect(entryGenerator.linkCodeChunks).toBeCalledTimes(1)
      expect(routerGenerator.generateComponent).toBeCalledTimes(1)

      const routerUIDL = {
        ...uidl.root,
        meta: {
          fileName: 'index',
        },
      }

      expect(routerGenerator.generateComponent).toBeCalledWith(
        routerUIDL,
        expect.objectContaining({
          localDependenciesPrefix: './pages/',
        })
      )
    })
  })

  describe('with the different component generators', () => {
    const generator = createProjectGenerator(secondStrategy)
    const { generator: componentsGenerator } = secondStrategy.components
    const { generator: pagesGenerator } = secondStrategy.pages
    const { generator: routerGenerator } = secondStrategy.router
    const { generator: entryGenerator } = secondStrategy.entry

    it('creates an instance of a project generator', () => {
      expect(generator.generateProject).toBeDefined()
      expect(generator.getAssetsPath).toBeDefined()
      expect(generator.addMapping).toBeDefined()
    })

    it('sets the default assets prefix', () => {
      expect(generator.getAssetsPath()).toBe('test/static')
    })

    it('sends the mapping to the component generators', () => {
      generator.addMapping(mockMapping)
      expect(componentsGenerator.addMapping).toBeCalledTimes(1)
      expect(componentsGenerator.addMapping).toBeCalledWith(mockMapping)
      expect(pagesGenerator.addMapping).toBeCalledTimes(1)
      expect(pagesGenerator.addMapping).toBeCalledWith(mockMapping)
    })

    it('calls the generators according to the strategy', async () => {
      await generator.generateProject(projectUIDL)

      const uidl = projectUIDL as ProjectUIDL

      // This adds the local dependencies on the UIDL, so we can proper assert below
      resolveLocalDependencies([], uidl.components, secondStrategy)

      expect(componentsGenerator.generateComponent).toBeCalledTimes(4)
      expect(componentsGenerator.generateComponent).toBeCalledWith(
        expect.objectContaining({ name: 'ExpandableArea' }),
        {
          assetsPrefix: '/static',
          projectRouteDefinition: uidl.root.stateDefinitions.route,
          mapping: {},
          skipValidation: true,
        }
      )
      expect(pagesGenerator.generateComponent).toBeCalledTimes(3)
      expect(pagesGenerator.generateComponent).toBeCalledWith(
        expect.objectContaining({
          name: 'Home',
        }),
        {
          assetsPrefix: '/static',
          projectRouteDefinition: uidl.root.stateDefinitions.route,
          mapping: {},
          skipValidation: true,
        }
      )
      expect(entryGenerator.linkCodeChunks).toBeCalledTimes(1)

      const routerUIDL = {
        ...uidl.root,
        meta: {
          fileName: secondStrategy.router.fileName,
        },
      }

      expect(routerGenerator.generateComponent).toBeCalledTimes(1)
      expect(routerGenerator.generateComponent).toBeCalledWith(
        routerUIDL,
        expect.objectContaining({
          localDependenciesPrefix: './pages/',
        })
      )
    })
  })
})
