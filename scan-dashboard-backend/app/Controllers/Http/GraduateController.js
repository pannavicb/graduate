class GraduateController {
  async show({ view }) {
    const graduates = await Database.table('graduates').orderBy('order_no')
    return view.render('graduates', { graduates })
  }
}
