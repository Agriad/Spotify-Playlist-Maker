class SongPromise {
  constructor(promise, previous, artist, title, album) {
    this.promise = promise;
    this.previous = previous;
    this.artist = artist;
    this.title = title;
    this.album = album;
  }

  addNext(songPromise) {
    this.next = songPromise;
  }

  getPromise() {
    return this.promise;
  }

  getNext() {
    return this.next;
  }

  getPrevious() {
    return this.previous;
  }

  getSongInfo() {
    return [this.artist, this.title, this.album];
  }
}
