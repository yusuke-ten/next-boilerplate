module.exports = function (plop) {
  plop.setGenerator('component', {
    description: 'コンポーネントを作成',
    prompts: [
      {
        message: 'コンポーネント名を入力してください:',
        name: 'componentName',
        type: 'input',
      },
      {
        message:
          'src/components/以下に続くコンポーネントのルーティングを入力してください（任意）:',
        name: 'componentRoute',
        type: 'input',
      },
    ],
    actions: function (data) {
      const actions = []
      let path = 'src/components'

      actions.push(
        {
          path: `${path}/{{kebabCase componentName}}.tsx`,
          skipIfExists: true,
          templateFile: 'plop-templates/component/component.tsx.hbs',
          type: 'add',
        },
        {
          path: `${path}/index.ts`,
          skipIfExists: true,
          templateFile: 'plop-templates/component/index.ts.hbs',
          type: 'add',
        },
        {
          path: `${path}/{{kebabCase componentName}}.stories.tsx`,
          skipIfExists: true,
          templateFile: 'plop-templates/component/component.stories.tsx.hbs',
          type: 'add',
        },
      )
      return actions
    },
  })
}
