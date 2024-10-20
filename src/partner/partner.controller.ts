import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PartnerService } from './partner.service';
import { CreatePartnerDto, UploadDocsDto } from './dto/partner.dto';
import { AwsS3Service } from 'src/utils/aws/aws.service';
import { CustomerAuthGuard } from 'src/common/useguards/customer.useguard';
import { ApiOperation } from '@nestjs/swagger';
import { CustomRequest } from 'src/common/interfaces/interface';
import { Partner } from './schema/partner.schema';

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

  @UseGuards(CustomerAuthGuard)
  @Get()
  async getAllPartners() {
    return this.partnerService.getAllPartners();
  }

  @Post('uploadDocs')
  async updateDocs(@Body() uploadDocsDto: UploadDocsDto) {
    const { fileName, fileExtension, name } = uploadDocsDto;
    const signedUrl = await this.awsService.getSignedUrl(
      name + '-' + fileName,
      fileExtension,
    );
    return { signedUrl };
  }

  @UseGuards(CustomerAuthGuard)
  @ApiOperation({ summary: 'Get currently logged-in customer' })
  @Get('/me')
  async getCustomerData(@Req() req: CustomRequest): Promise<Partner> {
    try {
      // console.log(req);
      const partner = req.partner as Partner; // Access the user from the request

      return partner;
    } catch (e) {
      throw new HttpException('UnAuthorized ', HttpStatus.UNAUTHORIZED);
    }
  }
}
