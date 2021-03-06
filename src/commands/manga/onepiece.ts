import { Command, Context } from 'patron'
import nodefetch from 'node-fetch'

interface OnepieceCommandArgs {
  chapter: number
  page: number
}

const OnepieceCommand = new Command({
  names: ['onepiece'],
  description: 'time to read One Piece',
  usableContexts: [Context.DM, Context.Guild],
  arguments: [
    {
      defaultValue: 1,
      example: '5',
      key: 'chapter',
      name: 'chapter #',
      type: 'integer'
    },
    {
      defaultValue: 1,
      example: '1',
      key: 'page',
      name: 'page #',
      type: 'integer'
    }
  ]
})

OnepieceCommand.run = async (message, args: OnepieceCommandArgs) => {
  const data = await nodefetch(`https://www.mangapanda.com/one-piece/${args.chapter}/${args.page}`)
    .then(res => res.text())
    .catch(() => undefined)
  if (!data) return

  const imgIndex = data.indexOf('id="img"')
  const imgString = data.substring(imgIndex)
  const srcIndex = imgString.indexOf('src=')
  const start = imgString.substring(srcIndex + 5)
  const endIndex = start.indexOf('" alt="')
  const url = start.substring(0, endIndex)

  const pagesIndex = data.indexOf('</select> of ')
  const pageStart = data.substring(pagesIndex + 13)
  const pagesEndIndex = pageStart.indexOf('</div>')
  const maxPages = Number(pageStart.substring(0, pagesEndIndex))

  const response = await message.channel.createMessage({
    embed: {
      title: `${args.chapter}/${args.page} - One Piece: Chapter ${args.chapter} Page ${
        args.page === maxPages ? 'Last' : args.page
      }`,
      image: { url },
      footer: { text: `Powered By MangaPanda` }
    }
  })

  if (args.page > 1) await response.addReaction('⬅')
  if (args.page + 1 <= maxPages) response.addReaction('➡')
}

module.exports = OnepieceCommand
