function Contact(RemoteId, IsDraft, CategoryId, CategoryName, DescriptionShort, Description, SubmitterName, Created, Modified, DistrictId, DistrictName, CompanyId, CompanyName, DivisionId, DivisionName, LocationId, LocationName, ConversationDate) {
    this.RemoteId = RemoteId;
    this.IsDraft = IsDraft;
    this.CategoryId = CategoryId;
    this.CategoryName = CategoryName;
    this.DescriptionShort = DescriptionShort;
    this.Description = Description;
    this.SubmitterName = SubmitterName;
    this.Created = Created;
    this.Modified = Modified;
    this.DistrictId = DistrictId;
    this.DistrictName = DistrictName;
    this.CompanyId = CompanyId;
    this.CompanyName = CompanyName;
    this.DivisionId = DivisionId;
    this.DivisionName = DivisionName;
    this.LocationId = LocationId;
    this.LocationName = LocationName;
    this.ConversationDate = ConversationDate;
    this.ImageArr = new Array();
    this.TaskArr = new Array();
}

function Image(Idx, ContactId, URL) {
    this.Idx = Idx;
    this.ContactId = ContactId;
    this.URL = URL;
}

function ContactTask(ContactId, Title, AssignedToId, AssigneeName) {
    this.ContactId = ContactId;
    this.Title = Title;
    this.AssignedToId = AssignedToId;
    this.AssigneeName = AssigneeName;
}

function Task(RemoteId, Title, AssignorName, Created, Modified) {
    this.RemoteId = RemoteId;
    this.Title = Title;
    this.AssignorName = AssignorName;
    this.Created = Created;
    this.Modified = Modified;
}