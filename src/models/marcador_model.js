export class Marcador {
  constructor(titulo, descricao, latitude, longitude, id = null) {
      this.id = id;
      this.titulo = titulo;
      this.descricao = descricao;
      this.latitude = latitude;
      this.longitude = longitude;
  }
}