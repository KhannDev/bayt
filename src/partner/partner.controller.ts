import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { PartnerService } from './partner.service';
import { CreatePartnerDto, UploadDocsDto } from './dto/partner.dto';
import { AwsS3Service } from 'src/utils/aws/aws.service';

@Controller('partners')
export class PartnerController {
  constructor(
    private readonly partnerService: PartnerService,
    private readonly awsService: AwsS3Service,
  ) {}

  @Post()
  async createPartner(@Body() createPartnerDto: CreatePartnerDto) {
    return this.partnerService.create(createPartnerDto);
  }

  @Post('update')
  async updatePartner(
    @Body() updatePartnerDto: { email: string; update: any },
  ) {
    return this.partnerService.findByEmailAndUpdate(
      updatePartnerDto.email,
      updatePartnerDto.update,
    );
  }

  @Get()
  async getAllPartners() {
    return this.partnerService.getAllPartners();
  }

  @Post('uploadDocs')
  async updateDocs(@Body() uploadDocsDto: UploadDocsDto) {
    const { fileName, fileExtension } = uploadDocsDto;
    const signedUrl = await this.awsService.getSignedUrl(
      fileName,
      fileExtension,
    );
    return { signedUrl };
  }
}
